#input data feature:
#   number change iterately
#   string doesn't change
#data must be arrange before processing
#all data must be in the same rule.
#input: a piece of source code
#output: source code written in specific language to generate input script


from RepeatedCodeInverse import ContinuousNumList2Rule, RepeatedCodeInverse
#read in file
#filename = 'output_verilog_pulser_assign.txt' OK
#filename = 'output_verilog_pulser_assign_mask.txt' #OK
#filename = 'output_verilog.txt'
filename = 'example.txt'
f = open(filename, 'r')
AllLine = f.readlines()
RepeatedCodeInverse(AllLine)