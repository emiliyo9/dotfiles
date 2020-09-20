import psutil

ram = psutil.virtual_memory()

print("MEM {}GB|{}GB".format(round(ram[3] / 1024**3, 1), round(ram[0] / 1024**3, 1)))
