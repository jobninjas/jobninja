import os

log_path = r"c:\Users\vsair\Downloads\novasquar-main\novasquad-main\nova-ninjas\backend\server_log.txt"

def search_log(path, query):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
        
    try:
        with open(path, 'r', encoding='utf-16') as f:
            for line in f:
                if query in line:
                    print(line.strip())
    except Exception as e:
        print(f"Error searching log: {e}")

if __name__ == "__main__":
    print("Searching for 'Attempting to send welcome email'...")
    search_log(log_path, "Attempting to send welcome email")
    print("\nSearching for 'Successfully sent email'...")
    search_log(log_path, "Successfully sent email")
    print("\nSearching for 'Failed to send email'...")
    search_log(log_path, "Failed to send email")
