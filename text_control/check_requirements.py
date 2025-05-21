"""
Check if required packages are installed
"""
import importlib.util
import sys


def is_package_installed(package_name):
    """Check if a package is installed"""
    return importlib.util.find_spec(package_name) is not None


def check_required_packages():
    """Check if all required packages are installed"""
    required_packages = [
        "awsgi2",
        "boto3",
        "flask",
    ]
    
    missing_packages = []
    
    for package in required_packages:
        if not is_package_installed(package):
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing required packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r requirements.txt")
        return False
    
    return True


if __name__ == "__main__":
    if not check_required_packages():
        sys.exit(1)
