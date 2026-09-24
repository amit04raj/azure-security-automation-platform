LENGTH_UNITS = {
    "m": 1,
    "km": 1000,
    "cm": 0.01,
    "mm": 0.001,
    "ft": 0.3048,
    "in": 0.0254,
}

WEIGHT_UNITS = {
    "kg": 1,
    "g": 0.001,
    "mg": 0.000001,
    "lb": 0.45359237,
    "oz": 0.028349523125,
}

DATA_UNITS = {
    "B": 1,
    "KB": 1000,
    "MB": 1000**2,
    "GB": 1000**3,
    "TB": 1000**4,
}


def convert_units(category: str, from_unit: str, to_unit: str, value: float) -> float:
    if category == "length":
        units = LENGTH_UNITS
    elif category == "weight":
        units = WEIGHT_UNITS
    elif category == "data":
        units = DATA_UNITS
    elif category == "temperature":
        return convert_temperature(from_unit, to_unit, value)
    else:
        raise ValueError("Unsupported conversion category")

    if from_unit not in units or to_unit not in units:
        raise ValueError(f"Unsupported unit for {category}")

    base_value = value * units[from_unit]
    return base_value / units[to_unit]


def convert_temperature(from_unit: str, to_unit: str, value: float) -> float:
    if from_unit not in {"C", "F", "K"} or to_unit not in {"C", "F", "K"}:
        raise ValueError("Unsupported temperature unit")

    if from_unit == to_unit:
        return value

    if from_unit == "C":
        celsius = value
    elif from_unit == "F":
        celsius = (value - 32) * 5 / 9
    else:
        celsius = value - 273.15

    if to_unit == "C":
        return celsius

    if to_unit == "F":
        return (celsius * 9 / 5) + 32

    return celsius + 273.15
