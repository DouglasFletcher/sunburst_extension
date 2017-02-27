

from __future__ import print_function
# ===========================
# == douglas fletcher
# == 2017.02.27
# == get data to json format
# ===========================

import sys
import os
import json
import csv
import time

# project base
os.chdir("..")
location = os.getcwd()
os.chdir(location + "\\python")

# =========
# functions
# =========
infile = location + "\\csv\\visit-sequences.csv"
outfile = location + "\\json\\visit-sequences.json"

def readdatadict(infile):
	# =======================
	# read data to dictionary
	# input: csv file
	# output: list of dicts
	# =======================
	print("reading csv data...")
	outdata = []
	exceptions = 0
	with open(infile) as fileref:
		for (i, row) in enumerate(fileref):
			try:
				# drop chars
				row = row.replace("\n", "")
				# pass empty lines
				if len(row.strip()) == 0:
					pass
				# create list, count dictionary
				else:
					rowlist = row.split(",")
					dictdat = {
						"path": rowlist[0].split("-")
						, "count": float(rowlist[1])
					}
					outdata.append(dictdat)
			except:
				exceptions += 1
	print("note: exception row reads: %s \n" %(exceptions))
	return outdata


def buildHierarchy(indata):
	# ======================
	# map flat path to json
	# input: path data
	# output: json heirrachy
	# ======================
	# base parent
	root = {"name": "root", "children":[]}
	# get data for each row
	for i, row in enumerate(indata):
		path = row["path"]
		path.append("START")
		pathlen = len(path)
		size = row["count"]
		# for each node of path
		currentNode = root
		for j, node in enumerate(path):
			children = currentNode["children"]
			nodeName = node
			# if not end of path
			if j + 1 <= pathlen:
				foundChild = False 
				# check for node in children
				for child in children:
					if (child["name"] == nodeName):
						childNode = child
						foundChild = True
						break
				# if no child node create it
				if not foundChild:
					if nodeName != "START":
						childNode = {"name": nodeName, "children":[]}
					if nodeName == "START":
						childNode = {"name": nodeName, "size":size}
					# append result
					children.append(childNode)
				# update current node
				currentNode = childNode
	return root


def write_output(jsonout, path):
	# ==================
	# write to json file
	# ==================
	print("writing json output...")
	with open(path, "w") as outfile:
		json.dump(jsonout, outfile, indent=2)
	outfile.close()


# ===============
# == process data
# ===============
if __name__ == "__main__":

	start_time = time.time()

	# process daten
	outdata = readdatadict(infile)
	jsonout = buildHierarchy(outdata)
	write_output(jsonout, outfile)

	print("--- %s seconds ---" % (time.time() - start_time))

