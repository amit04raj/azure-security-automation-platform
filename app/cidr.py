import ipaddress


def calculate_cidr(cidr: str) -> dict:
    try:
        network = ipaddress.ip_network(cidr.strip(), strict=False)
    except ValueError:
        raise ValueError("Invalid IPv4 CIDR notation")

    if network.version != 4:
        raise ValueError("Only IPv4 CIDR notation is supported")

    total_addresses = network.num_addresses

    if network.prefixlen <= 30:
        first_host = network.network_address + 1
        last_host = network.broadcast_address - 1
        usable_hosts = total_addresses - 2
    elif network.prefixlen == 31:
        first_host = None
        last_host = None
        usable_hosts = 0
    else:
        first_host = network.network_address
        last_host = network.network_address
        usable_hosts = 1

    return {
        "network": str(network.network_address),
        "broadcast": str(network.broadcast_address),
        "subnet_mask": str(network.netmask),
        "wildcard_mask": str(network.hostmask),
        "first_host": str(first_host) if first_host else None,
        "last_host": str(last_host) if last_host else None,
        "total_addresses": total_addresses,
        "usable_hosts": usable_hosts,
        "prefix_length": network.prefixlen,
    }
