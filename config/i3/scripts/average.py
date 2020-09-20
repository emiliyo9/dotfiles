import tkinter as tk
import yaml
from tkinter import simpledialog
import sys, getopt

argv = sys.argv[1:]
opts, args = getopt.getopt(argv,"ap",["average","prompt"])
for opt, arg in opts:
    if opt in ("-a", "--average"):
        with open("/home/emile/.config/i3/scripts/average.yaml", 'r') as file:
            scores = yaml.load(file, Loader=yaml.FullLoader)
        print("{:.2f}".format(scores["total"] / scores["amount"]))

    elif opt in ("-p", "--prompt"):
        root = tk.Tk()

        root.withdraw()
        # the input dialog
        score = int(simpledialog.askstring(title="Dialog",
                prompt="How many turns did it take:"))
        
        with open("/home/emile/.config/i3/scripts/average.yaml", 'r') as file:
            scores = yaml.load(file, Loader=yaml.FullLoader)
        
        scores["amount"] += 1
        scores["total"] += score
        
        with open("/home/emile/.config/i3/scripts/average.yaml", 'w') as file:
            yaml.dump(scores, file)
        
