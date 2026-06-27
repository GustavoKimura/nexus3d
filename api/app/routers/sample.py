import os
import math
import tempfile
import random
from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse

router = APIRouter(prefix="/sample", tags=["Sample"])


def cleanup_temp_file(path: str):
    try:
        os.remove(path)
    except Exception:
        pass


@router.get("/")
def get_sample_file(background_tasks: BackgroundTasks):
    fd, temp_path = tempfile.mkstemp(suffix=".xyz")
    num_points = 100000
    shape_type = random.choice(["sphere", "torus", "cube"])

    with os.fdopen(fd, "w") as f:
        for _ in range(num_points):
            if shape_type == "sphere":
                theta = random.uniform(0, 2 * math.pi)
                phi = math.acos(random.uniform(-1.0, 1.0))
                r = random.gauss(5.0, 0.03)
                x = r * math.sin(phi) * math.cos(theta)
                y = r * math.sin(phi) * math.sin(theta)
                z = r * math.cos(phi)
            elif shape_type == "torus":
                u = random.uniform(0, 2 * math.pi)
                v = random.uniform(0, 2 * math.pi)
                major_r = 3.0
                minor_r = random.gauss(1.0, 0.03)
                x = (major_r + minor_r * math.cos(v)) * math.cos(u)
                y = (major_r + minor_r * math.cos(v)) * math.sin(u)
                z = minor_r * math.sin(v)
            else:
                face = random.randint(0, 5)
                u = random.uniform(-3.0, 3.0)
                v = random.uniform(-3.0, 3.0)
                n = random.gauss(3.0, 0.03)
                if face == 0:
                    x, y, z = n, u, v
                elif face == 1:
                    x, y, z = -n, u, v
                elif face == 2:
                    x, y, z = u, n, v
                elif face == 3:
                    x, y, z = u, -n, v
                elif face == 4:
                    x, y, z = u, v, n
                else:
                    x, y, z = u, v, -n

            f.write(f"{x:.4f} {y:.4f} {z:.4f}\n")

    background_tasks.add_task(cleanup_temp_file, temp_path)
    return FileResponse(
        path=temp_path, filename=f"generated_{shape_type}.xyz", media_type="text/plain"
    )
