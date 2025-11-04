import os
import shutil
import zipfile
import platform
import requests
import json
import yaml
import subprocess

# Function to read a JSON file and return its contents
def read_json_file(file_path):
    with open(file_path, 'r', encoding="utf8") as file:
        return json.load(file)
# Load configuration data from JSON file
# config = read_json_file("configData/config.json")
config = read_json_file(os.path.join("..","CHANGE_ME.json"))
ctk_name_mapping = config["ctk_name_mapping"]
reportGeneratorSrc = config.get("reportGeneratorSrc")
if not reportGeneratorSrc:
    reportGeneratorSrc = os.path.join("..","..")

   
goldenComponentPath = config.get("standardComponentPath")
if not goldenComponentPath:
    goldenComponentPath = os.path.join("..","resources","standard-components")

resources_dir = os.path.join(reportGeneratorSrc, 'componentCTK', 'resources') 
standard_components_dir = goldenComponentPath

os.makedirs(resources_dir, exist_ok=True)
os.makedirs(standard_components_dir, exist_ok=True)
ctk_mapping = {}

component_namespace = config.get("component_namespace")
if not component_namespace:
    component_namespace = "components"

# Function to write data to a JSON file
def write_json_file(filename, data):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)

# Function to read a YAML file and return its contents
def read_yaml_file(file_path):
    with open(file_path, 'r', encoding="utf8") as file:
        return yaml.safe_load(file)

# Determine the operating system
def determine_os():
    system = platform.system()
    os_map = {'Windows': 'windows', 'Darwin': 'mac', 'Linux': 'linux'}
    if system in os_map:
        return os_map[system]
    raise RuntimeError(f"Unsupported OS: {system}")

# Set the CTK command mapping based on the OS
def set_ctk_mapping(name, ctk_unzip_path, manifest_path):
    current_os = determine_os()
    command_map = {
        'windows': 'Windows-Bat-RUNCTK.bat',
        'mac': 'Mac-Linux-RUNCTK.sh',
        'linux': 'Mac-Linux-RUNCTK.sh'
    }
    command = command_map.get(current_os, 'Mac-Linux-RUNCTK.sh')
    ctk_mapping[name] = os.path.join(ctk_unzip_path, ctk_name_mapping[name], command)

    api_path = ""

    # Update individual CTKs config.json with the URL
    config_path = os.path.join(ctk_unzip_path, ctk_name_mapping[name], 'config.json')
    ctk_config = read_json_file(config_path)
    base_url = config["url"]  # Base URL from configData/config.json
    ctk_config['url'] = f"{base_url.rstrip('/')}{api_path}/"  # Combine base URL with API path
    write_json_file(config_path, ctk_config)

# Download Standard Component Specification from Ready-for-publication repository
def download_standard_component_specification(componentName):
    download_info = config.get("standardComponentDownload")
    ssl_verify = download_info.get("sslVerify", True)

    # Look for existing file in goldenComponentPath that starts with componentName
    for file in os.listdir(goldenComponentPath):
        if file.startswith(componentName) and file.endswith(".yaml"):
            existing_path = os.path.join(goldenComponentPath, file)
            print(f"Found existing YAML for {componentName}: {existing_path}")
            return existing_path
    
    # Construct API URL to get data from github:
    contents_api_url = (
        f"{download_info.get('apiBaseUrl')}/repos/"
        f"{download_info.get('repoOwner')}/"
        f"{download_info.get('repoName')}/contents?ref={download_info.get('gitBranch')}"
    )
    print(f"Component download url: {contents_api_url}")
    response = requests.get(contents_api_url, verify=ssl_verify)
    if response.status_code != 200:
        print(f"Failed to fetch contents. Status: {response.status_code}")
        return None
    
    contents = response.json()

    # Find the folder matching the component ID prefix
    component_folder = None
    for item in contents:
        if item["type"] == "dir" and item["name"].startswith(componentName + "-"):
            component_folder = item["name"]
            break
    
    if not component_folder:
        print(f"No matching folder found for component {componentName}")
        return None
    
    # Construct raw URL to the YAML file
    filename = f"{component_folder}.yaml"
    repo_path = download_info.get('repoPath', '')
    repo_path_struct = f"/{repo_path}" if repo_path else ""
    raw_url = (
        f"{download_info.get('gitUrl')}/{download_info.get('gitBranch')}/"
        f"{component_folder}{repo_path_struct}/{filename}"
    )

    # Target Path
    destination_path = os.path.join(goldenComponentPath, filename)
    print(f"Downloading YAML from: {raw_url}")

    yaml_response = requests.get(raw_url, verify=ssl_verify)

    if yaml_response.status_code == 200:
        with open(destination_path, "w", encoding="utf-8") as f:
            f.write(yaml_response.text)
        print(f"Component YAML saved to: {destination_path}")
    else:
        print(f"Failed to download YAML file. Status: {yaml_response.status_code}")
        return None
    
    return destination_path


# Clear the results folder before running the CTK
def clear_results_folder(results_dir):
    try:
        if os.path.exists(results_dir):
            shutil.rmtree(results_dir)
            print(f"Cleared old results directory: {results_dir}")
    except Exception as e:
        print(f"Failed to delete results directory. Error: {e}")

    try:
        os.makedirs(results_dir, exist_ok=True)
        print(f"Created fresh results directory: {results_dir}")
    except Exception as e:
        print(f"Failed to create results directory. Error: {e}")

# Consolidate all the CTK json results into a single JSON file
def consolidate_results_to_json(results_dir, payload_output_dir):
    consolidated = {
        "resultsSummary": None,
        "apiCtkResults": [],
        "configurationReport": None,
        "deploymentReport": None,
        "bddResults": None,
        "bddPayloads": {}
    }

    summary_path = os.path.join(results_dir, "reportData.json")
    if os.path.exists(summary_path):
        with open(summary_path, "r", encoding="utf-8") as f:
            consolidated["resultsSummary"] = json.load(f)
    
    api_ctk_dir = os.path.join(results_dir, "api-ctk-results")
    if os.path.isdir(api_ctk_dir):
        for f in os.listdir(api_ctk_dir):
            if f.endswith(".json"):
                with open(os.path.join(api_ctk_dir, f), "r", encoding="utf-8") as file:
                    result = json.load(file)
                    consolidated["apiCtkResults"].append({
                        "file": f,
                        "data": result
                    })
    
    configuration_path = os.path.join(results_dir, "baseline-ctk", "Configuration-report.json")
    if os.path.exists(configuration_path):
        with open(configuration_path, "r", encoding="utf-8") as f:
            consolidated["configurationReport"] = json.load(f)

    deployment_path = os.path.join(results_dir, "baseline-ctk", "deployment-report.json")
    if os.path.exists(deployment_path):
        with open(deployment_path, "r", encoding="utf-8") as f:
            consolidated["deploymentReport"] = json.load(f)

    bdd_path = os.path.join(results_dir, "cucumber-bdd", "results.json")
    if os.path.exists(bdd_path):
        with open(bdd_path, "r", encoding="utf-8") as f:
            consolidated["bddResults"] = json.load(f)

    if os.path.exists(payload_output_dir):
        for file in os.listdir(payload_output_dir):
            if file.endswith(".json"):
                with open(os.path.join(payload_output_dir, file), "r", encoding="utf-8") as f:
                    consolidated["bddPayloads"][file] = json.load(f)

    output_file = os.path.join(reportGeneratorSrc, "componentCTK", "resources", "consolidatedResults.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(consolidated, f, indent=2)
    
    return output_file

# Normalizes the CTK folder structure to ensure the required files are directly under the CTK folder
def normalize_ctk_directory(ctk_folder_path):
    nested_ctk_path = os.path.join(ctk_folder_path, "CTK")
    nested_config_path = os.path.join(nested_ctk_path, "config.json")
    temp_ctk_path = os.path.join(ctk_folder_path, "_temp_ctk")
    print(f"nested_ctk_path: {nested_ctk_path}, nested_config_path: {nested_config_path}")
    print(f"is nested ctk path dir: {os.path.isdir(nested_ctk_path)} config is file: {os.path.isfile(nested_config_path)}")
    if os.path.isdir(nested_ctk_path) and os.path.isfile(nested_config_path):
        print(f"Found nested CTK structure at: {nested_ctk_path}")
        os.rename(nested_ctk_path, temp_ctk_path)
        for item in os.listdir(temp_ctk_path):
            src = os.path.join(temp_ctk_path, item)
            dst = os.path.join(ctk_folder_path, item)

            if os.path.exists(dst):
                if os.path.isdir(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            
            shutil.move(src,dst)
            print(f"Moved '{src}' to '{dst}'")
        os.rmdir(temp_ctk_path)
        print(f"Removed Nested CTK folder: {nested_ctk_path}")
    else:
        print(f"CTK directory structure is already normalized at: {ctk_folder_path}")
    
    ri_path = os.path.join(ctk_folder_path, "RI")
    if os.path.isdir(ri_path):
        shutil.rmtree(ri_path)

# Get a list of YAML files in a specified directory
def read_file_path_folder(path):
    original_dir = os.getcwd()
    os.chdir(path)
    yaml_files = {file: os.path.join(path, file) for file in os.listdir() if file.endswith(".yaml")}
    os.chdir(original_dir)
    return yaml_files


# Download a remote CTK JSON file
def downloadRemoteCtkJson(url, token):
    print("Entry downloadCtkJson")
    headers = {
        "Authorization": f"token {token}"
    }
    response = requests.get(url, headers=headers, verify=False)
    if response.status_code == 200:
        with open("configData/apiIndex.json", 'wb') as file:
            file.write(response.content)
        print("Response saved to configData/apiIndex.json")
    else:
        print(f"Request failed with status code {response.status_code}")


# Download a file from a URL
def download_file(url, local_filename):
    print(url)
    response = requests.get(url, stream=True, verify=False)
    if response.status_code == 200:
        with open(local_filename, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"File downloaded successfully: {local_filename}")
    else:
        print(f"Failed to retrieve the file. Status code: {response.status_code}")


# Unzip a file to a specified directory
def unzip_file(zip_path, extract_to_folder):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to_folder)
        print(f"File extracted to: {extract_to_folder}")


# Delete a directory and its contents
def delete_folder(long_path):
    try:
        for item in long_path.rglob('*'):
            item.unlink() if item.is_file() else item.rmdir()
        long_path.rmdir()
        print(f"Folder removed: {long_path}")
    except (FileNotFoundError, PermissionError, OSError) as e:
        print(f"Error: {e}")


# Overwrite or rename a file or directory
def overwrite_or_rename(src, dst, name):
    if os.path.exists(dst):
        if os.path.isfile(dst):
            os.remove(dst)
        elif os.path.isdir(dst):
            shutil.rmtree(dst)

    try:
        os.rename(src, dst)
        print(f"Renamed {src} to {dst}")
    except FileNotFoundError:
        print(f"Error: {src} does not exist.")
        handle_special_rename(src, dst, name)
    except PermissionError:
        print(f"Error: Permission denied for renaming {src} to {dst}.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


# Handle special cases for renaming when the folder name is different
def handle_special_rename(src, dst, name):
    src_new = os.path.dirname(src)
    for dir_ in [entry for entry in os.listdir(src_new) if os.path.isdir(os.path.join(src_new, entry))]:
        if name in os.path.basename(dir_):
            overwrite_or_rename(os.path.join(src_new, os.path.basename(dir_)), dst, name)


# Download and unzip the CTK
def download_ctk(name):
    ctk_path = read_yaml_file('configData/apiIndex.json')
    for ctk in ctk_path:
        if (name in ctk_name_mapping and (ctk_name_mapping[name] == ctk)) or ((name in ctk) and ("_v4" in ctk)):

            major_version = ctk.split('_v')[1].split('.')[0] 

            ctk_name_mapping[name] = f"{ctk.split('_v')[0]}_v{major_version}"
            download_url = ctk_path[ctk]['ctk']
            
            filename = os.path.basename(download_url)
            root, ext = os.path.splitext(filename)
            # ctk_download_path = f'{reportGeneratorSrc}/componentCTK/resources/api-ctks/{ctk_name_mapping[name]}.zip'
            ctk_download_path_root = os.path.join(reportGeneratorSrc, 'componentCTK', 'resources', 'api-ctks')
            os.makedirs(ctk_download_path_root,exist_ok=True)
            ctk_download_path = os.path.join(ctk_download_path_root, f'{ctk_name_mapping[name]}.zip')
            # ctk_unzip_path = f'{reportGeneratorSrc}/componentCTK/resources/api-ctks'
            ctk_unzip_path = os.path.join(reportGeneratorSrc, 'componentCTK', 'resources', 'api-ctks')
            
            if not os.path.exists(ctk_unzip_path):
                os.makedirs(ctk_unzip_path, exist_ok=True)

            if not os.path.exists(os.path.join(ctk_unzip_path, ctk_name_mapping[name])):
                download_file(download_url, ctk_download_path)
                unzip_file(ctk_download_path, ctk_unzip_path)

                long_path = r'//?/{}'.format(os.path.join(os.getcwd(), ctk_unzip_path, ctk_name_mapping[name]))
                if os.path.exists(long_path):
                    shutil.rmtree(long_path)

                overwrite_or_rename(os.path.join(ctk_unzip_path, 'CTK'),
                                    os.path.join(ctk_unzip_path, ctk_name_mapping[name]), name)
                ctk_folder_path = os.path.join(ctk_unzip_path, ctk_name_mapping[name])
                normalize_ctk_directory(ctk_folder_path)

                # overwrite_or_rename(os.path.join(ctk_unzip_path, root),
                #                     os.path.join(ctk_unzip_path, ctk_name_mapping[name]), name)
            manifest_path = os.path.join(reportGeneratorSrc, f'componentCTK/resources/component-{config["releaseName"]}.yaml')
            #set_ctk_mapping(name, ctk_unzip_path, manifest_path)

# Copy results from source to destination
def copyResults(source_file, destination_file):
    shutil.copy(source_file, destination_file)


# Copy an entire directory tree
def copyResultsFolder(src_dir, dst_dir):
    if os.path.exists(src_dir):
        shutil.copytree(src_dir, dst_dir)
    else:
        print(f"⚠️ Unable to copy results: {src_dir} does not exist.")


# Generate the report by running npm commands
def generateReport():
    os.chdir(f"{reportGeneratorSrc}/componentCTK/src")
    os.system("npm install")
    os.system("npm start")


# Generate a YAML file from deployed component
def generateComponentYaml(releasename):
    output_path = os.path.join(reportGeneratorSrc, f"componentCTK/resources/component-{releasename}.yaml")
    try:
        result = subprocess.run(
            ["helm", "get", "manifest", releasename, "-n", component_namespace],
            capture_output=True,
            text=True,
            check=True
        )
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result.stdout)
        print(f"Component manifest saved to: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to get component manifest for release '{releasename}'.")
        print(f"  Error: {e.stderr.strip()}")
        raise RuntimeError(f"Aborting CTK run due to missing manifest for: {releasename}")


# Run the CTK command in a specified path
def run_ctk_v2(path):
    current_os = determine_os()

    if current_os in ['mac', 'linux']:
        path = './' + path

    return_code = os.system(path)
    print("Return code:", return_code)


# Execute the CTK for a specific API
def run_ctk(api_id, path):
    c_path = os.getcwd()
    dirname = os.path.dirname(path)
    filename = os.path.basename(path)
    os.chdir(dirname)
    # Change Permission of ctk executable file
    os.chmod(filename, 0o755)

    run_ctk_v2(filename)

    # Prepare paths for results
    html_path = f'api-ctks/{ctk_name_mapping[api_id]}/htmlResults.html'
    json_path = f'api-ctks/{ctk_name_mapping[api_id]}/jsonResults.json'
    os.chdir('../..')
    dest_path = 'results/api-ctk-results'
    os.makedirs(dest_path, exist_ok=True)

    # Copy results to the destination directory
    copyResults(html_path, os.path.join(dest_path, f"{ctk_name_mapping[api_id]}.html"))
    copyResults(json_path, os.path.join(dest_path, f"{ctk_name_mapping[api_id]}.json"))

    os.chdir(c_path)

# Prepare BDD payloads directory
def prepare_payload_dir(payload_dir):
    if os.path.exists(payload_dir):
        shutil.rmtree(payload_dir)
        print(f"Cleared existing payloads directory: {payload_dir}")
    os.makedirs(payload_dir, exist_ok=True)
    print(f"Created bdd payloads directory: {payload_dir}")

def generate_bdd_payload_files_for_component_under_test(bdd_payloads, payload_output_dir, component_to_run):
    component_payloads = bdd_payloads.get(component_to_run.lower(), {})
    for file_name, payload in component_payloads.items():
        file_path = os.path.join(payload_output_dir, f"{file_name}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"Created payload file: {file_path}")

# Main executor function
def ctkExecutor():
#    filePaths = read_file_path_folder(goldenComponentPath)

    component_to_run = config.get("component_to_run")
    if not component_to_run:
        print("No Component Name found to run the CTK")
        return
    else:
        component_to_run = component_to_run.upper()

# Clear results folder
    results_dir = os.path.join(reportGeneratorSrc, "componentCTK", "resources", "results")
    clear_results_folder(results_dir)

# Download standard component specification from TM Forum Github repository
    component_yaml_path = download_standard_component_specification(component_to_run)

    if not component_yaml_path:
        print("Component YAML could not be downloaded.")
        return
    else:
        print(f"Component YAML is ready at: {component_yaml_path}")


    print("Generating component.yaml file for deployed Component.")
    generateComponentYaml(config.get('releaseName'))

    ctkconfig_path = os.path.join(reportGeneratorSrc, 'componentCTK', 'src', 'ctkconfig.json')
    #ctkconfig = read_json_file(ctkconfig_path)

    if os.path.exists(ctkconfig_path):
        os.remove(ctkconfig_path)
        print(f"Old ctkconfig.json removed from: {ctkconfig_path}")
    ctkconfig = {}
    update_ctkconfig(ctkconfig, os.path.basename(component_yaml_path))

    write_json_file(ctkconfig_path, ctkconfig)

    current_dir = os.getcwd()

# Setup BDD Payloads for Component Under Test
    bdd_payloads = config.get("bddPayloads", {})
    payload_output_dir = os.path.join(reportGeneratorSrc, 'componentCTK', 'src', 'features', 'payloads')
    prepare_payload_dir(payload_output_dir)
    generate_bdd_payload_files_for_component_under_test(bdd_payloads, payload_output_dir, component_to_run)

# Read yaml file to process apis
    print("reading yaml file at path: ", component_yaml_path)
    yaml_content = read_yaml_file(component_yaml_path)

    # Process APIs from YAML content
    process_apis(yaml_content, current_dir)

    # Generate the report
    print("Generating Report")
    generateReport()
    os.chdir(current_dir)

    consolidated_results = consolidate_results_to_json(results_dir, payload_output_dir)

    # Create reports directory if it doesn't exist
    reports_dir = os.path.join(reportGeneratorSrc, "componentCTK", "Reports")
    os.makedirs(reports_dir, exist_ok=True)

    # Prepare destination path for the report
    dest_path = os.path.join(reports_dir, os.path.basename(component_yaml_path).split('.')[0])
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path)

    copyResultsFolder(os.path.join(reportGeneratorSrc, 'componentCTK', 'resources', 'reports'),
                        os.path.join(dest_path, 'reports'))
    copyResultsFolder(os.path.join(reportGeneratorSrc, 'componentCTK', 'resources', 'results'),
                        os.path.join(dest_path, 'results'))
    copyResults(consolidated_results, os.path.join(dest_path, "consolidateResults.json"))


# Update CTK configuration based on the file path
def update_ctkconfig(ctkconfig, path):
    base_config = config.get("ctkconfig", {})
    for key, value in base_config.items():
        ctkconfig[key] = value

    ctkconfig["goldenComponentFilePath"] = f"../resources/standard-components/{path}"
    ctkconfig["componentName"] = path.split('.')[0]
    ctkconfig["componentFilePath"] = f"../resources/component-{config.get('releaseName')}.yaml"
    ctkconfig["component_namespace"] = component_namespace

    # Set optional run flags
    optional_flags = ['runExposedOptional', 'runDependentOptional', 'runSecurityOptional']
    for flag in optional_flags:
        ctkconfig[flag] = config.get(flag, False)

    if "ctkConfig" not in ctkconfig:
        ctkconfig["ctkConfig"] = {}


# Process APIs for execution based on YAML content
def process_apis(yaml_content, current_dir):
    core_functions = yaml_content.get("spec", {}).get("coreFunction", {})
    security_functions = yaml_content.get("spec", {}).get("securityFunction", {})

    api_types = {
        'ExposedAPIs': core_functions.get("exposedAPIs", []),
        'DependentAPIs': core_functions.get("dependentAPIs", []),
        'SecurityAPIs': security_functions.get("exposedAPIs", [])
    }

    for api_type, apis in api_types.items():
        print("=" * 30)
        print(f"{api_type.replace('APIs', ' APIs')}")
        print("=" * 30)
        for api in apis:
            print(f"Checking CTK for {api['id']}")
            try:
                if api['required'] or config[f"run{api_type.replace('APIs', 'Optional')}"]:
                    print(f"Downloading CTK for {api['id']}")

                    download_ctk(api['id'])
#                if ctk_mapping.get(api['id']) and (
#                        api['required'] or config[f"run{api_type.replace('APIs', 'Optional')}"]):
#                    print("Executing CTK Commands")
#                    run_ctk(api['id'], ctk_mapping[api['id']])
            except KeyError:
                print(f'{api["id"]} CTK not available due to error {KeyError}')


# Entry point for the script
if __name__ == "__main__":
    ctkExecutor()
