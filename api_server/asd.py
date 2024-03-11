import pathlib
import logging
import warnings

from version import __riva_version__

machine_type="AMD64" #Change this to `ARM64_linux` or `ARM64_l4t` in case of an ARM64 machine.
target_machine="AMD64" #Change this to `ARM64_linux` or `ARM64_l4t` in case of an ARM64 machine.
acoustic_model = None ##acoustic_model .riva location
vocoder = None ##vocoder .riva location
out_dir = pathlib.Path.cwd() / "out" ##Output directory to store the generated RMIR. The RMIR will be placed in `${out_dir}/RMIR/RMIR_NAME.rmir`.
voice = "test" ##Voice name
key = "tlt_encode" ##Encryption key used during nemo2riva
use_ipa = "yes" ##`"y"` or `"Y"` if the model uses `ipa`, no otherwise.
lang = "en-US" ##Language
sample_rate = 44100 ##Sample rate of the audios
num_speakers = 2 ## Number of speakers

riva_aux_files = None ##Riva model repo path. In the case of a custom model repo, change this to the full path of the custom Riva model repo.
riva_tn_files = None ##Riva model repo path. In the case of a custom model repo, change this to the full path of the custom Riva model repo.

## Riva NGC, servicemaker image config.
if machine_type.lower() in ["amd64", "arm64_linux"]:
    riva_init_image = f"nvcr.io/nvidia/riva/riva-speech:{__riva_version__}-servicemaker"
elif machine_type.lower()=="arm64_l4t":
    riva_init_image = f"nvcr.io/nvidia/riva/riva-speech:{__riva_version__}-servicemaker-l4t-aarch64"
rmir_dir = out_dir / "rmir"

if not out_dir.exists():
    out_dir.mkdir()
if not rmir_dir.exists():
    rmir_dir.mkdir()

def ngc_download_and_get_dir(ngc_resource_name, var, var_name, resource_type="model"):
    default_download_folder = "_v".join(ngc_resource_name.split("/")[-1].split(":"))
   # !rm -rf ./riva_artifacts/{default_download_folder}
   # ngc_output = !ngc registry {resource_type} download-version {ngc_resource_name} --dest riva_artifacts
    output = pathlib.Path(f"./riva_artifacts/{default_download_folder}")
    if not output.exists():
       # ngc_output_formatted='\n'.join(ngc_output)
        logging.error(
            f"NGC was not able to download the requested model {ngc_resource_name}. "
            "Please check the NGC error message, removed all directories, and re-start the "
            f"notebook. NGC message: {ngc_output_formatted}"
        )
        return None
    if "model" in resource_type:
        riva_files_in_dir = list(output.glob("*.riva"))
        if len(riva_files_in_dir) > 0:
            output = riva_files_in_dir[0]
    if output is not None and var is not None:
        warnings.warn(
            f"`{var_name}` had a non-default value of `{var}`. `{var_name}` will be updated to `{var}`"
        )
    return output