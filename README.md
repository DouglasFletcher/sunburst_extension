# sunburst extensions
## add customizations to sunburst d3 graph

The purpose of this repository is to add to base d3 Sunburst graph https://bl.ocks.org/kerryrodden/7090426. Instead of processing csv 
file to json on-the-fly in javascript, this is moved back to preprocessing script in python. I simply did this to reduce the complexity 
of the javascript file, given I have added some custom functions there. In addition to this, I have added drop down options, so the sunburst automatically filters the data on the fly. This is useful if you want to add another dimension to the view e.g. multiple kpi measures. There is also a function which resizes the different kpis, based on a scale value. If you want to update the file with your own data, there are a few places to change static text values i.e. "KPI One - Count". If you want to use this feel free. Gist for this repo can be found here http://bl.ocks.org/DouglasFletcher/34dd743e9c9c9f8d8926dcc126158330
(https://gist.github.com/DouglasFletcher/34dd743e9c9c9f8d8926dcc126158330)

