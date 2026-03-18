import os

log_path = r"c:\Users\vsair\Downloads\novasquar-main\novasquad-main\nova-ninjas\backend\server_log.txt"

def read_utf16le_log(path, num_lines=200):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
        
    try:
        with open(path, 'r', encoding='utf-16') as f:
            lines = f.readlines()
            # print last num_lines
            for line in lines[-num_lines:]:
                print(line.strip())
    except Exception as e:
        print(f"Error reading log: {e}")

if __name__ == "__main__":
    read_utf16le_log(log_path)
