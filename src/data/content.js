export const tools = [
  {
    category: "Recon and Enumeration",
    name: "subfinder",
    purpose: "Fast passive subdomain discovery from curated sources",
    install: "go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest",
    usage: [
      "subfinder -d target.com -silent -all",
      "subfinder -dL domains.txt -o subdomains.txt",
    ],
  },
  {
    category: "Recon and Enumeration",
    name: "amass",
    purpose: "Comprehensive asset discovery and enumeration",
    install: "sudo snap install amass",
    usage: [
      "amass enum -passive -d target.com -o amass.txt",
      "amass intel -d target.com -whois",
    ],
  },
  {
    category: "Recon and Enumeration",
    name: "assetfinder",
    purpose: "Quick domain and subdomain discovery",
    install: "go install github.com/tomnomnom/assetfinder@latest",
    usage: [
      "assetfinder --subs-only target.com",
      "assetfinder target.com | sort -u",
    ],
  },
  {
    category: "HTTP and Crawling",
    name: "httpx",
    purpose: "Probe alive HTTP services and fingerprint responses",
    install: "go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest",
    usage: [
      "httpx -l subdomains.txt -title -status-code -tech-detect -o live.txt",
      "cat subdomains.txt | httpx -silent -mc 200,302",
    ],
  },
  {
    category: "HTTP and Crawling",
    name: "katana",
    purpose: "High-speed crawler for endpoint and parameter discovery",
    install: "go install github.com/projectdiscovery/katana/cmd/katana@latest",
    usage: [
      "katana -u https://target.com -d 5 -jc -o katana-urls.txt",
      "katana -list live.txt -d 3 -silent",
    ],
  },
  {
    category: "HTTP and Crawling",
    name: "gau",
    purpose: "Fetch archived URLs from multiple historical sources",
    install: "go install github.com/lc/gau/v2/cmd/gau@latest",
    usage: [
      "gau target.com | tee gau.txt",
      "cat domains.txt | gau --threads 10",
    ],
  },
  {
    category: "HTTP and Crawling",
    name: "waybackurls",
    purpose: "Retrieve URLs from the Wayback Machine",
    install: "go install github.com/tomnomnom/waybackurls@latest",
    usage: [
      "echo target.com | waybackurls",
      "cat domains.txt | waybackurls | sort -u > wayback.txt",
    ],
  },
  {
    category: "Scanning and Fuzzing",
    name: "nuclei",
    purpose: "Template-based vulnerability scanner",
    install: "go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",
    usage: [
      "nuclei -l live.txt -severity low,medium,high,critical",
      "nuclei -u https://target.com -tags cve,misconfig",
    ],
  },
  {
    category: "Scanning and Fuzzing",
    name: "ffuf",
    purpose: "Fast directory and parameter fuzzing",
    install: "go install -v github.com/ffuf/ffuf/v2@latest",
    usage: [
      "ffuf -u https://target.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt",
      "ffuf -u 'https://target.com/page?FUZZ=test' -w params.txt -fs 0",
    ],
  },
  {
    category: "Scanning and Fuzzing",
    name: "dirsearch",
    purpose: "Bruteforce files and directories on web servers",
    install: "python3 -m pip install dirsearch",
    usage: [
      "dirsearch -u https://target.com -e php,js,txt,html",
      "dirsearch -l live.txt -i 200,204,301,302,307,401",
    ],
  },
  {
    category: "Scanning and Fuzzing",
    name: "dalfox",
    purpose: "Automated XSS scanner and payload manager",
    install: "go install github.com/hahwul/dalfox/v2@latest",
    usage: [
      "dalfox url 'https://target.com/search?q=test'",
      "dalfox file params.txt --worker 30 --skip-bav",
    ],
  },
  {
    category: "Scanning and Fuzzing",
    name: "sqlmap",
    purpose: "Detect and exploit SQL injection",
    install: "python3 -m pip install sqlmap",
    usage: [
      "sqlmap -u 'https://target.com/item?id=1' --batch --risk=3 --level=5",
      "sqlmap -r request.txt --dbs --batch",
    ],
  },
  {
    category: "Intercepting and Analysis",
    name: "Burp Suite Community",
    purpose: "Manual web testing proxy and repeater workflow",
    install: "sudo apt install -y burpsuite",
    usage: [
      "Open Burp and set browser proxy to 127.0.0.1:8080",
      "Send interesting requests to Repeater and compare responses",
    ],
  },
  {
    category: "Intercepting and Analysis",
    name: "OWASP ZAP",
    purpose: "Open-source web proxy and active scanner",
    install: "sudo apt install -y zaproxy",
    usage: [
      "zaproxy",
      "Use Quick Start > Automated Scan for initial mapping",
    ],
  },
  {
    category: "Intercepting and Analysis",
    name: "mitmproxy",
    purpose: "CLI/TUI intercepting proxy for traffic analysis",
    install: "python3 -m pip install mitmproxy",
    usage: [
      "mitmproxy --listen-port 8081",
      "mitmdump -w traffic_dump.mitm",
    ],
  },
  {
    category: "JS and Secret Hunting",
    name: "gf",
    purpose: "Pattern matcher for suspicious parameter hunting",
    install: "go install github.com/tomnomnom/gf@latest",
    usage: [
      "cat urls.txt | gf xss",
      "cat urls.txt | gf sqli",
    ],
  },
  {
    category: "JS and Secret Hunting",
    name: "LinkFinder",
    purpose: "Extract endpoints from JavaScript files",
    install: "python3 -m pip install linkfinder",
    usage: [
      "python3 -m linkfinder -i https://target.com/app.js -o cli",
      "python3 -m linkfinder -i js-files.txt -d",
    ],
  },
  {
    category: "JS and Secret Hunting",
    name: "SecretFinder",
    purpose: "Detect API keys and secrets in JavaScript",
    install: "python3 -m pip install secretfinder",
    usage: [
      "python3 -m SecretFinder -i https://target.com/main.js -o cli",
      "python3 -m SecretFinder -i local.js -o html",
    ],
  },
  {
    category: "JS and Secret Hunting",
    name: "trufflehog",
    purpose: "Search for leaked secrets in git and files",
    install: "python3 -m pip install trufflehog",
    usage: [
      "trufflehog git https://github.com/org/repo",
      "trufflehog filesystem ./ --only-verified",
    ],
  },
  {
    category: "API Testing",
    name: "kiterunner",
    purpose: "API route discovery and endpoint brute forcing",
    install: "go install github.com/assetnote/kiterunner@latest",
    usage: [
      "kr scan https://api.target.com -w routes-large.kite",
      "kr brute https://api.target.com -w apis.txt",
    ],
  },
  {
    category: "API Testing",
    name: "Postman",
    purpose: "API request crafting, auth flow testing, and chaining",
    install: "sudo snap install postman",
    usage: [
      "Create collections for each role (user/admin)",
      "Use environment variables and run collection tests",
    ],
  },
  {
    category: "API Testing",
    name: "Insomnia",
    purpose: "Lightweight API client for structured testing",
    install: "sudo snap install insomnia",
    usage: [
      "Create workspace per target and tag risky endpoints",
      "Use generated code snippets to reproduce API bugs",
    ],
  },
]
