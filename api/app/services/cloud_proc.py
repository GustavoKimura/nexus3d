import numpy as np


def process_point_cloud(points: list) -> dict:
    points_array = np.array(points)

    if points_array.size == 0:
        return {"valid_points_count": 0, "anomaly_detected": False}

    z_coords = points_array[:, 2]
    valid_points = points_array[(z_coords >= 0) & (z_coords <= 10)]
    valid_points_count = len(valid_points)

    return {
        "valid_points_count": valid_points_count,
        "anomaly_detected": valid_points_count > 100,
    }
