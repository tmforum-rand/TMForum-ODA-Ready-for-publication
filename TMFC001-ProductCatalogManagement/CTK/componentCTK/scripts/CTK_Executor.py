import os
import shutil
import zipfile
import platform
import requests
import json
import yaml
import subprocess
import re
import tempfile
from pathlib import Path

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
ssl_verify = config.get("download_sslVerify", True)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_DATA_DIR = os.path.join(SCRIPT_DIR, "configData")
RUNTIME_API_INDEX_PATH = os.path.join(CONFIG_DATA_DIR, "apiIndex.json")

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

def delete_runtime_api_index():
    """Deletes the runtime-generated apiIndex.json (Option A)."""
    try:
        if os.path.exists(RUNTIME_API_INDEX_PATH):
            os.remove(RUNTIME_API_INDEX_PATH)
            print("🧹 Deleted runtime apiIndex.json")
    except Exception as e:
        print(f"⚠️ Could not delete runtime apiIndex.json: {e}")

def fetch_runtime_api_index_json() -> dict:
    """Downloads the new api index JSON from the script-defined S3 URL."""
    
    api_index_url = "https://tmf-open-api-table-documents.s3.eu-west-1.amazonaws.com/Indexes/index.json"

    if not api_index_url.startswith(("http://", "https://")):
        raise RuntimeError("❌ api_index_url is not set correctly in the script.")

    try:
        print("⬇ Downloading runtime API index...")
        resp = requests.get(api_index_url, timeout=60, verify=ssl_verify)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise RuntimeError(f"❌ Failed to download runtime API index (network/TLS/HTTP). Reason: {e}")
    
def convert_new_index_to_legacy(new_index: dict) -> dict:
    """
    Convert new S3 index structure into legacy mapping:
      legacy_key = "{TMFxxx}_{vN.N.N}"
      value = { "name": ..., "swagger": ..., "ctk": ... }
    """
    legacy = {}

    api_index_section = "OpenApiTable"
    api_table = new_index.get(api_index_section, {})
    if not isinstance(api_table, dict):
        raise RuntimeError(f"❌ Index JSON missing expected section '{api_index_section}' or it is not an object.")

    for api_id, entries in api_table.items():
        if not isinstance(entries, list):
            continue

        for entry in entries:
            version_info = entry.get("version_info")  # e.g. "v4.0.0"
            if not version_info:
                continue

            api_name = ((entry.get("api_description") or {}).get("api_name")) or api_id

            swagger_url = None
            ctk_url = None

            for opt in (entry.get("options") or []):
                opt_type = (opt.get("type") or "").lower()
                if opt_type == "swagger" and not swagger_url:
                    swagger_url = opt.get("download")
                elif opt_type == "ctk" and not ctk_url:
                    ctk_url = opt.get("download")

            # Only include if CTK exists (critical for your downloader)
            if not ctk_url:
                continue

            legacy_key = f"{api_id}_{version_info}"  # e.g. TMF669_v4.0.0
            legacy[legacy_key] = {
                "name": api_name,
                "swagger": swagger_url,
                "ctk": ctk_url
            }

    if not legacy:
        raise RuntimeError("❌ Converted legacy apiIndex is empty. Check the index file format/content.")

    return legacy

def prepare_runtime_api_index_file():
    """
    Downloads new index → converts to legacy → writes configData/apiIndex.json.
    Also deletes any existing runtime apiIndex.json first.
    """
    # Ensure folder exists
    os.makedirs(CONFIG_DATA_DIR, exist_ok=True)

    # Remove old runtime file if present
    delete_runtime_api_index()

    # Download + convert
    new_index = fetch_runtime_api_index_json()
    legacy_index = convert_new_index_to_legacy(new_index)

    # Write to runtime apiIndex.json
    try:
        with open(RUNTIME_API_INDEX_PATH, "w", encoding="utf-8") as f:
            json.dump(legacy_index, f, indent=2)
        print(f"✔ Runtime apiIndex.json created (entries: {len(legacy_index)})")
    except Exception as e:
        raise RuntimeError(f"❌ Failed writing runtime apiIndex.json. Reason: {e}")

# Download Standard Component Specification from Ready-for-publication repository
def download_standard_component_specification(componentName):
    download_info = config.get("standardComponentDownload")

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

def normalize_ctk_directory(ctk_folder_path):
    """
    Normalizes both v4 and v5 CTK directory structures.

    RULES:
      V4 → must contain config.json at root
        - if config.json inside child folder → move contents up one level
        - delete RI/ if present
      V5 → must contain CHANGE_ME.json at root
        - if CHANGE_ME.json inside child folder → move contents up one level

    No flattening, no restructuring, no deleting other folders.
    """

    # ------------------------------------------------------------
    # 1. Detect CTK TYPE (v4 or v5)
    # ------------------------------------------------------------
    root_config = os.path.join(ctk_folder_path, "config.json")
    root_change_me = os.path.join(ctk_folder_path, "CHANGE_ME.json")

    is_v4 = os.path.isfile(root_config)
    is_v5 = os.path.isfile(root_change_me)

    # ------------------------------------------------------------
    # 2. Case A — ROOT HAS required file → CTK already correct
    # ------------------------------------------------------------
    if is_v4:
        print(f"✔ CTK is v4 and correctly structured at root: {ctk_folder_path}")
        _cleanup_v4_ri_directory(ctk_folder_path)
        return

    if is_v5:
        print(f"✔ CTK is v5 and correctly structured at root: {ctk_folder_path}")
        return

    # ------------------------------------------------------------
    # 3. Case B — Required file is nested → locate nested CTK root
    # ------------------------------------------------------------
    nested_candidate = None
    detected_marker = None
    #expected_file = "config.json" if not is_v5 else "CHANGE_ME.json"

    for entry in os.listdir(ctk_folder_path):
        candidate = os.path.join(ctk_folder_path, entry)
        if not os.path.isdir(candidate):
            continue

        if os.path.isfile(os.path.join(candidate, "CHANGE_ME.json")):
            nested_candidate = candidate
            detected_marker = "CHANGE_ME.json"
            break

        if os.path.isfile(os.path.join(candidate, "config.json")):
            nested_candidate = candidate
            detected_marker = "config.json"
            break

    if not nested_candidate:
        raise RuntimeError(
            f"❌ Could not find `config.json` or `CHANGE_ME.json` in root or child folder of {ctk_folder_path}"
        )

    print(f"📁 Found nested CTK root: {nested_candidate}")

    # ------------------------------------------------------------
    # 4. Move nested CTK contents up one level (NO FLATTENING)
    # ------------------------------------------------------------
    for item in os.listdir(nested_candidate):
        src = os.path.join(nested_candidate, item)
        dst = os.path.join(ctk_folder_path, item)

        # Remove existing destination if present
        if os.path.exists(dst):
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)

        shutil.move(src, dst)
        print(f"⬆️  Moved `{src}` → `{dst}`")

    # Remove now-empty nested folder
    shutil.rmtree(nested_candidate)
    print(f"🧹 Removed nested folder: {nested_candidate}")

    # ------------------------------------------------------------
    # 5. v4 clean-up — remove RI/ folder
    # ------------------------------------------------------------
    if detected_marker == "config.json":
        _cleanup_v4_ri_directory(ctk_folder_path)

    print(f"✔ CTK normalized successfully at: {ctk_folder_path}")


def _cleanup_v4_ri_directory(ctk_folder_path):
    """Delete RI folder for v4 CTKs only."""
    ri_path = os.path.join(ctk_folder_path, "RI")
    if os.path.isdir(ri_path):
        shutil.rmtree(ri_path)
        print(f"🗑️  Removed RI folder (v4 only): {ri_path}")

# Download a file from a URL
def download_file(url, local_filename):
    #print(url)
    response = requests.get(url, stream=True, verify=ssl_verify)
    if response.status_code == 200:
        with open(local_filename, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"File downloaded successfully: {local_filename}")
    else:
        raise RuntimeError(f"❌ Failed to download file {local_filename} (HTTP {response.status_code}) at {url}.")

# Download and unzip the CTK
def download_ctk_version(ctk_key):
    """
    Downloads and normalizes the CTK for a specific API version.
    ctk_key format: 'TMF620_v5.1.0'
    """
    if not os.path.exists(RUNTIME_API_INDEX_PATH):
        raise RuntimeError(
            f"❌ Runtime apiIndex.json not found at {RUNTIME_API_INDEX_PATH}. "
            f"Cannot proceed."
        )

    api_index = read_json_file(RUNTIME_API_INDEX_PATH)
    
    if ctk_key not in api_index:
        raise RuntimeError(
            f"❌ CTK key '{ctk_key}' not found in apiIndex.json → Certification cannot proceed."
        )
    
    download_url = api_index[ctk_key]["ctk"]

    # Directory structure
    ctk_download_root = os.path.join(reportGeneratorSrc, "componentCTK", "resources", "api-ctks")
    os.makedirs(ctk_download_root, exist_ok=True)
    zip_path = os.path.join(ctk_download_root, f"{ctk_key}.zip")
    extract_path = ctk_download_root   # CTK unzips into this root folder
    ctk_folder_name = ctk_key          # Final folder expected: api-ctks/TMF620_v5.1.0/

    final_ctk_path = os.path.join(ctk_download_root, ctk_folder_name)

    # If CTK already exists, skip downloading
    if os.path.exists(final_ctk_path):
        print(f"✔ CTK already present for: {ctk_key}")
        return
    
    print(f"⬇ Downloading CTK for {ctk_key}: {download_url}")
    try:
        download_file(download_url, zip_path)
    except Exception as e:
        raise RuntimeError(
            f"❌ Failed downloading CTK file for {ctk_key} → {str(e)}"
        )

    with tempfile.TemporaryDirectory(prefix=f"ctk_extract_{ctk_key}_") as tmpdir:
        extract_dir = Path(tmpdir)
        print(f"📦 Unzipping CTK for {ctk_key} into temp dir: {extract_dir}")
        _safe_extract_zip(zip_path, extract_dir)

        # Identify ctk root inside the extracted content
        ctk_source_root = _find_best_ctk_root(extract_dir)
        if not ctk_source_root:
            _debug_tree(extract_dir, max_depth=4)
            raise RuntimeError(
                f"❌ No CTK folder found after extraction for {ctk_key} in temp dir {extract_dir}"
            )
        print(f"📁 Identified extracted CTK root: {ctk_source_root}")
        ctk_source_root = Path(ctk_source_root)
        final_ctk_path = Path(final_ctk_path)
        # Ensure clean final destination
        if final_ctk_path.exists():
            shutil.rmtree(final_ctk_path)
        final_ctk_path.mkdir(parents=True, exist_ok=True)

        for item in ctk_source_root.iterdir():
            shutil.move(str(item), str(final_ctk_path / item.name))

    try:
        normalize_ctk_directory(str(final_ctk_path))
    except Exception as e:
        raise RuntimeError(
            f"❌ Failed normalizing CTK directory for {ctk_key}: {str(e)}"
        )
    
    print(f"✔ CTK ready at: {final_ctk_path}")

def _safe_extract_zip(zip_path: Path, extract_dir: Path) -> None:
    """
    Extract ZIP safely:
        - skip __MACOSX folders and ._ files
        - prevent ZipSlip path traversal attacks
    """
    with zipfile.ZipFile(zip_path, 'r') as z:
        for member in z.infolist():
            name = member.filename

            # Skip macOS junk
            if name.startswith("__MACOSX/") or "/__MACOSX/" in name:
                continue
            if Path(name).name.startswith("._"):
                continue

            # ZipSlip protection
            target_path = (extract_dir / name).resolve()
            if not str(target_path).startswith(str(extract_dir.resolve())):
                raise RuntimeError(f"Blocked suspicious zip entry: {name}")
            
            z.extract(member, path=extract_dir)
            
def _find_best_ctk_root(extract_dir: Path) -> Path | None:
    """
    Scan extracted tree and pick the directory that most looks like a CTK root.
    Handles v4 and v5 and wrapper folders like CTK/ or CTK-TMFxxx/
    """

    # ✅ FIRST: check extract_dir itself
    if _score_ctk_dir(extract_dir) >= 50:
        return extract_dir

    candidates: list[tuple[int, Path]] = []

    # include extract_dir itself and all subdirectories
    dirs = [extract_dir] + [p for p in extract_dir.rglob('*') if p.is_dir()]
    for d in dirs:
        if d.name == "__MACOSX":
            continue
        score = _score_ctk_dir(d)
        if score > 0:
            candidates.append((score, d))
    if not candidates:
        return None
    
    # sort by score desc, then shallower_path first
    candidates.sort(key=lambda t: (-t[0], len(t[1].parts)))
    return candidates[0][1]

def _score_ctk_dir(dir_path: Path) -> int:
    """
    Heuristic scoring to identify CTK root.
    """
    score = 0

    # v5 markers
    if (dir_path / "DO_NOT_CHANGE").is_dir():
        score += 50
        if (dir_path / "CHANGE_ME.json").is_file():
            score += 30
        if (dir_path / "DO_NOT_CHANGE" / "cypress").is_dir():
            score += 10

    # v4 markers
    if (dir_path / "ctk").is_dir():
        score += 30
    if (dir_path / "config.json").is_file():
        score += 30
    if (dir_path / "run.sh").is_file():
        score += 10
    if (dir_path / "run.bat").is_file():
        score += 5
    if (dir_path / "Mac-Linux-RUNCTK.sh").is_file():
        score += 10
    if (dir_path / "Windows-Bat-RUNCTK.bat").is_file():
        score += 10
    
    # wrapped folder hint
    if dir_path.name.upper() == "CTK":
        score += 5

    return score

def _debug_tree(root_path: Path, max_depth: int = 3) -> None:
    print(f"\n Debug tree for : {root_path}")
    for p in sorted(root_path.rglob("*")):
        rel = p.relative_to(root_path)
        if len(rel.parts) > max_depth:
            continue
        indent = " " * (len(rel.parts) - 1)
        suffix = "/" if p.is_dir() else ""
        print(f"{indent}- {rel}{suffix}")
    print("")
    

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

    prepare_runtime_api_index_file()

    try:
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
        manifest_path = os.path.join(reportGeneratorSrc, f"componentCTK/resources/component-{config.get('releaseName')}.yaml")
        resolved_api_versions = resolve_api_versions(manifest_path)
        ctkconfig_path = os.path.join(reportGeneratorSrc, 'componentCTK', 'src', 'ctkconfig.json')
        #ctkconfig = read_json_file(ctkconfig_path)

        if os.path.exists(ctkconfig_path):
            os.remove(ctkconfig_path)
            print(f"Old ctkconfig.json removed from: {ctkconfig_path}")
        ctkconfig = {}
        update_ctkconfig(ctkconfig, os.path.basename(component_yaml_path), resolved_api_versions)

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
        process_apis(yaml_content, current_dir, resolved_api_versions)

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
        copyResults(consolidated_results, os.path.join(dest_path, "consolidatedResults.json"))
    
    finally:
        # --- Always delete runtime apiIndex.json ---
        delete_runtime_api_index()


# Update CTK configuration based on the file path
def update_ctkconfig(ctkconfig, path, resolved_api_versions):
    base_config = config.get("ctkconfig", {})
    for key, value in base_config.items():
        ctkconfig[key] = value

    ctkconfig["goldenComponentFilePath"] = f"../resources/standard-components/{path}"
    ctkconfig["componentName"] = path.split('.')[0]
    ctkconfig["componentFilePath"] = f"../resources/component-{config.get('releaseName')}.yaml"
    ctkconfig["component_namespace"] = component_namespace
    ctkconfig["apiVersionUnderTest"] = config.get("apiVersionUnderTest", "v4")
    ctkconfig["apiVersionOverrides"] = config.get("apiVersionOverrides", {})
    ctkconfig["resolvedAPIVersions"] = resolved_api_versions
    ctkconfig["ctkLogging"] = config.get("ctkLogging")

    # Set optional run flags
    optional_flags = ['runExposedOptional', 'runDependentOptional', 'runSecurityOptional']
    for flag in optional_flags:
        ctkconfig[flag] = config.get(flag, False)

    if "ctkConfig" not in ctkconfig:
        ctkconfig["ctkConfig"] = {}

def resolve_api_versions(manifest_path):
    """
    Produces a dict mapping API ID → major version ("v4" / "v5").
    """
    # ---- Step 0: Read deployed manifest ----
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            deployed_docs = list(yaml.safe_load_all(f))
    except Exception as e:
        print(f"❌ Failed reading deployed manifest: {e}")
        return {}
    
    # Extract deployed component document
    deployed_component = next(
        (doc for doc in deployed_docs if isinstance(doc, dict) and doc.get("kind", "").lower() == "component"),
        None
    )
    if not deployed_component:
        print("❌ No Component manifest found in deployed manifest")
        return {}
    deployed_spec = deployed_component.get("spec", {})
    resolved_versions = {}

    api_sources = [
        deployed_spec.get("coreFunction", {}).get("exposedAPIs", []),
        deployed_spec.get("coreFunction", {}).get("dependentAPIs", []),
        deployed_spec.get("securityFunction", {}).get("exposedAPIs", []),
        deployed_spec.get("securityFunction", {}).get("dependentAPIs", []),
    ]

    api_version_under_test = config.get("apiVersionUnderTest", None)
    api_version_overrides = config.get("apiVersionOverrides", {})
    for api_list in api_sources:
        versions = collect_versions(
            api_list,
            api_version_under_test,
            api_version_overrides
        )
        resolved_versions.update(versions)

    return resolved_versions

def extract_version_from_url(url: str) -> str:
    """
    Extracts full semantic version (e.g., v4.1.0) from a TMF OpenAPI specification URL.

    Supports patterns like:
      - /v4.1.0/
      - /4.1.0/swagger
      - _v4.1.0_swagger.json
      - _v4.0_swagger.json  (→ v4.0.0)
    """

    if not url:
        return None

    # 1️⃣ Case: versions explicitly start with 'v' → v4.1.0
    match = re.search(r'v(\d+\.\d+\.\d+)', url, re.IGNORECASE)
    if match:
        return f"v{match.group(1)}"

    # 2️⃣ Case: version without 'v' → /4.1.0/
    match = re.search(r'(\d+\.\d+\.\d+)', url)
    if match:
        return f"v{match.group(1)}"

    # 3️⃣ Case: versions like v4.0 (no patch) → treat as v4.0.0
    match = re.search(r'v(\d+\.\d+)', url, re.IGNORECASE)
    if match:
        return f"v{match.group(1)}.0"

    # 4️⃣ Case: versions like 4.0 (no patch)
    match = re.search(r'(\d+\.\d+)', url)
    if match:
        return f"v{match.group(1)}.0"

    # ❌ No version found
    return None

def extract_major_version(spec_entry):
        if not spec_entry:
            return None

        # Prefer explicit version field
        version = spec_entry.get("version")
        if version:
            major = version.split('.')[0].lower().lstrip('v')
            return f"v{major}" 

        # Else extract from URL
        url = spec_entry.get("url", "")
        match = re.findall(r"/v(\d+)", url) or re.findall(r"v(\d+)\.", url)
        if match:
            return f"v{match[-1]}"
        return None

def collect_versions(api_list, api_version_under_test, api_version_overrides):
    resolved = {}
    for api in api_list or []:
        api_id = api.get("id")
        spec_array = api.get("specification", []) or []

        if not spec_array:
            print(f"⚠️ No specification array found for API {api_id}")
            continue

        extracted_version = []
        for spec in spec_array:
            major = extract_major_version(spec)
            if major:
                extracted_version.append(major)

        if not extracted_version:
            print(f"⚠️ No valid versions found in specification array for API {api_id}")
            continue

        selected_version = None

        api_override = api_version_overrides.get(api_id)
        if api_override:
            if api_override in extracted_version:
                selected_version = api_override
            else:
                print(f"❌ API-specific override {api_override} NOT found for {api_id}. "
                      f"Available: {extracted_version}. Falling back...")
            
        if not selected_version and api_version_under_test:
            if api_version_under_test in extracted_version:
                selected_version = api_version_under_test
            else:
                print(f"⚠️ Global override {api_version_under_test} does NOT match for {api_id}. "
                      f"Available: {extracted_version}. Falling back...")
                
        if not selected_version:
            selected_version = extracted_version[0]

        resolved[api_id] = selected_version
        print(f"✔ Selected version for {api_id}: {selected_version} (from {extracted_version})")
    
    return resolved

def find_spec_for_version(spec_list, version_under_test):
    """
    Returns the specification entry matching the requested API version.
    version_under_test can be 'v4' or 'v5'.
    The spec entries contain full versions like 'v5.1.0' or 'v4.1.0'.
    """
    for entry in spec_list:
        spec_version = entry.get("version", "").lower()
        if spec_version.startswith(version_under_test.lower()):
            return entry
    return None

# Process APIs for execution based on YAML content
def process_apis(yaml_content, current_dir, resolved_api_versions):
    """
    Version-aware CTK downloader.
    Picks the right specification[] entry based on:
      - config["apiVersionOverrides"]
      - global config["apiVersionUnderTest"]
    """

    core_functions = yaml_content.get("spec", {}).get("coreFunction", {})
    security_functions = yaml_content.get("spec", {}).get("securityFunction", {})

    api_types = {
        'ExposedAPIs': core_functions.get("exposedAPIs", []),
        'DependentAPIs': core_functions.get("dependentAPIs", []),
        'SecurityAPIs': security_functions.get("exposedAPIs", [])
    }

    for api_type, apis in api_types.items():
        print("\n" + "=" * 40)
        print(f"{api_type.replace('APIs', ' APIs')} (Version-aware CTK Download)")
        print("=" * 40)

        for api in apis:
            print(f"Checking CTK for {api['id']}")
            api_id = api['id']

                # --- Normalize booleans ---
            required = api.get("required", False)
            if isinstance(required, str):
                required = required.strip().lower() == "true"

            run_optional = config.get(
                f"run{api_type.replace('APIs','Optional')}", 
                False
            )

            # --- SKIP optional APIs early ---
            if not (required or run_optional):
                print(f"⏭ Skipping optional API {api_id} (required={required})")
                continue

            print(f"➡ Processing API: {api_id}")
            spec_list = api.get("specification", [])
            print(f"\n➡ Processing API: {api_id}")

            if api_id not in resolved_api_versions:
                print(f"ℹ️ Version for {api_id} not found in resolved_api_versions → deriving from specification[0].url")

                if not spec_list:
                    raise RuntimeError(f"❌ API {api_id} has no specification[] array!")

                # Extract version from first specification entry URL
                url = spec_list[0].get("url")
                if not url:
                    raise RuntimeError(f"❌ Could not determine version for {api_id}: no URL in specification[0].")

                derived_version = extract_version_from_url(url)            # e.g. v4.1.0
                major_version = derived_version.split(".")[0]              # → v4

                resolved_api_versions[api_id] = major_version
                print(f"   ✔ Populated: {api_id} → {major_version}")

            version_to_test = resolved_api_versions[api_id]
            print(f"   ✔ Using resolved version: {version_to_test}")

            spec_entry = find_spec_for_version(spec_list, version_to_test)

            if not spec_entry:
                error_msg = (
                    f"\n❌ FATAL ERROR: Version mismatch detected.\n"
                    f"   API ID: {api_id}\n"
                    f"   Requested version under test: {version_to_test}\n"
                    f"   BUT the component only exposes versions: "
                    f"{[entry.get('version') for entry in spec_list]}\n\n"
                    f"💥 Cannot run CTK because the chosen API version does not exist.\n"
                    f"   → Fix your CHANGE_ME.json or component specification.\n"
                )
                print(error_msg)
                raise RuntimeError(error_msg)

            full_version = extract_version_from_url(spec_entry["url"])     # e.g., v5.1.0
            ctk_key = f"{api_id}_{full_version}"

            try:
                if api['required'] or config[f"run{api_type.replace('APIs', 'Optional')}"]:
                    print(f"⬇ Selecting CTK key: {ctk_key}")
                    download_ctk_version(ctk_key)
            except Exception as e:
                error_msg = (
                    f"\n❌ FATAL: Failed to download or prepare CTK for API '{api_id}' "
                    f"(version: {full_version}).\n"
                    f"Reason: {str(e)}\n"
                    f"→ Cannot continue CTK execution.\n"
                )
                print(error_msg)
                raise RuntimeError(error_msg)


# Entry point for the script
if __name__ == "__main__":
    ctkExecutor()