from datetime import datetime
import platform
import socket
import os
from sys import argv

class IPScanner:
    """Scans the provided IP

    Ex. - python ip_scanner.py "192.168.1." "80, 554" "5" "15"
    """

    ports = (80,)
    base_ip = "192.168.1."

    start_ip = 1
    end_ip = 255

    def __init__(self, base_ip = "192.168.1.", ports = (80, ), start_ip = 1, end_ip = 255):
        self.base_ip = base_ip if base_ip else self.base_ip
        self.ports = ports if ports else self.ports
        self.start_ip = start_ip if start_ip else self.start_ip
        self.end_ip = end_ip if end_ip else self.end_ip

    def start_scanning(self):
        """Start scanning the provided ip address and ports
        """
        socket.setdefaulttimeout(1)

        start_time = datetime.now()
        block_separator = "================="
        print(block_separator)
        print("Scanning in Progress:")
        print(block_separator)

        for port in self.ports:
            live_ips = []
            print("---------------------------------------")
            for (i, ip) in enumerate(range(self.start_ip, self.end_ip + 1)):
                if i != 0:
                    print("|-------------------------------------|")
                address = f"{self.base_ip}{ip}"
                result_ip = f"{address}:{port}"
                space_length = 30
                # if self.ping_ip(address):
                if self.connect_socket(address, port):
                    print(f"|{result_ip:{space_length}}|  1  |")
                    live_ips.append(address)
                else:
                    print(f"|{result_ip:{space_length}}|  0  |")
            print("---------------------------------------")
            print(f"Live ip addresses on port {port} - ")
            print("\n".join(live_ips))
            print(block_separator)

        end_time = datetime.now()
        total = end_time - start_time
        print(f"Scanning completed in: {total}")
        print(block_separator)
        return live_ips

    def connect_socket(self, address, port) -> bool:
        """Connect to socket of given address and port

        Args:
            address (str): IP address
            port (str): Port no

        Returns:
            bool: Returns true if socket connection made to address and port
        """
        socket_connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = socket_connection.connect_ex((address, port))
        return result == 0

    def get_current_ip(self, adapter="en0") -> str:
        """Gets current IP of adapter passed

        Args:
            adapter (str, optional): Adapter name for which ip needs to be found. Defaults to "en0".

        Returns:
            str: IP Address in str format if found else None
        """
        response = os.popen(f"ipconfig getifaddr {adapter}")
        ip = None
        for line in response.readlines():
            ip = line
        return ip

    def get_ping_command(self):
        operating_system = platform.system()
        if (operating_system == "Windows"):
            ping_command = "ping -n 1 "
        elif (operating_system == "Linux"):
            ping_command = "ping -c 1 "
        else :
            ping_command = "ping -c 1 "
        return ping_command

    def ping_ip(self, address):
        comm = self.get_ping_command() + address
        response = os.popen(comm)
    
        live = 0
        for line in response.readlines():
            if line.count("ttl"):
                live = 1
        return live

def main():
    base_ip = None
    ports = None
    start_ip = None
    end_ip = None
    try:
        base_ip = argv[1]
        ports = [int(port) for port in argv[2].split(",") ]
        start_ip = int(argv[3])
        end_ip = int(argv[4])
    except Exception as e:
        print(f"Unable to read arguments, running with default properties - {e}")
    ipScanner= IPScanner(base_ip=base_ip, ports=ports, start_ip=start_ip, end_ip=end_ip)
    ipScanner.start_scanning()

if __name__ == "__main__":
    main()
