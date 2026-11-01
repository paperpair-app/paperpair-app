"""Make the installable web app (../index.html) from the built paperpair.html.
Run from source/ after build.py:  python3 build_site.py path/to/paperpair.html"""
import sys,re,os
src=sys.argv[1] if len(sys.argv)>1 else "paperpair.html"
t=open(src).read()
def rep(a,b):
    global t
    assert a in t,a[:60]; t=t.replace(a,b,1)
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"></script>\n','')
rep('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','lib/pdf.min.js')
rep('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js','lib/jszip.min.js')
rep('GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"','GlobalWorkerOptions.workerSrc="lib/pdf.worker.min.js"')
rep('const urls=["https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"','const urls=["lib/pdf-lib.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"')
head=open(os.path.join(os.path.dirname(__file__),"site_head.html")).read()
tail=open(os.path.join(os.path.dirname(__file__),"site_tail.html")).read()
open(os.path.join(os.path.dirname(__file__),"..","index.html"),"w").write(head+t+tail)
print("index.html written")
