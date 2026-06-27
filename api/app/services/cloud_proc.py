import numpy as np
import open3d as o3d


def process_point_cloud(points: list) -> dict:
    points_array = np.array(points, dtype=np.float64)

    if points_array.size == 0 or points_array.ndim != 2 or points_array.shape[1] != 3:
        return {
            "valid_points_count": 0,
            "density": 0.0,
            "anomaly_detected": False,
            "limits": {"min": [], "max": []},
        }

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points_array)

    if len(pcd.points) < 3:
        inlier_pcd = pcd
    else:
        cl, ind = pcd.remove_statistical_outlier(
            nb_neighbors=min(20, len(pcd.points) - 1), std_ratio=2.0
        )
        inlier_pcd = pcd.select_by_index(ind)

    valid_points_count = len(inlier_pcd.points)

    if valid_points_count == 0:
        return {
            "valid_points_count": 0,
            "density": 0.0,
            "anomaly_detected": False,
            "limits": {"min": [], "max": []},
        }

    bbox = inlier_pcd.get_axis_aligned_bounding_box()
    volume = bbox.volume()
    density = valid_points_count / volume if volume > 0 else 0.0

    limits = {
        "min": bbox.get_min_bound().tolist(),
        "max": bbox.get_max_bound().tolist(),
    }

    anomaly_detected = valid_points_count > 100

    return {
        "valid_points_count": valid_points_count,
        "density": density,
        "anomaly_detected": anomaly_detected,
        "limits": limits,
    }
