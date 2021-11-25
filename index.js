// Import stylesheets
import './style.css';
import clusterdata from './cluster-data.json';

import clusterdatamin from './cluster-data-min.json';

import clusterdatamax from './cluster-data-max.json';

import * as echarts from 'echarts';

import { SVGRenderer, CanvasRenderer } from 'echarts/renderers';

var myChart = echarts.init(document.getElementById('main'),'EN',{ renderer: 'canvas' });

var selectionItem;
var searchKeys = [];

myChart.showLoading();

// Specify the configuration items and data for the chart
var option = {
  title: {
    text: '',
  },
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
  },
  blendMode:'source-over',
  hoverLayerThreshold: 100,
  series: [
    {
      type: 'tree',
      data: [clusterdatamax],
      left: '20%',
      right: '20%',
      top: '20%',
      bottom: '20%',
      layout: 'orthogonal',
      symbol: 'emptyCircle',
      symbolSize: '9',
      orient: 'TB',
      expandAndCollapse: true,
      roam:true,
      hideOverlap: true,
      moveOverlap: 'shiftX',
      initialTreeDepth: 2,
      label: {
        position: 'inside',
        rotate: 0,
        verticalAlign: 'middle',
        align: 'center',
        fontSize: 9,
      },
      leaves: {
        label: {
          position: 'inside',
          rotate: 0,
          verticalAlign: 'middle',
          align: 'center',
        },
      },
      animationDurationUpdate: 750,
    }
  ],
  
};

// Display the chart using the configuration items and data just specified.
myChart.setOption(option);

setTimeout(function () {
  myChart.hideLoading();
}, 2000);

myChart.on('click', 'series.tree', function (obj) {
  selectionItem = obj;
  console.log(selectionItem);
  if(selectionItem && selectionItem.data.children.length > 90) {
    myChart.showLoading();
    option.series[0].data = [selectionItem.data];
    option.series[0].layout = 'radial';
    myChart.setOption(option);
    myChart.hideLoading();
  }
});

document.getElementById('reload').addEventListener('click', function () {
  myChart.showLoading();
  option.series[0].data = [clusterdatamin];
  myChart.setOption(option);
  myChart.hideLoading();
});

document.getElementById('reset').addEventListener('click', function () {
  myChart.showLoading();
  option.series[0].data = [clusterdata];
  option.series[0].layout = 'orthogonal';
  myChart.setOption(option);
  myChart.hideLoading();
});

function remove(data, name) {
  return data.children.some((each) => {
    if (each.name == name) {
      data.children = data.children.filter((itr) => {
        return itr.name != name;
      });
    }
    return each.name == name;
  });
}

function del(keys, obj, searchTxt) {
  if (keys.length == 1) {
    return remove(obj, searchTxt);
  }
  if (keys.length > 1) {
    console.log(obj);
    console.log(searchTxt);
    searchKeys = searchKeys.filter((each) => {
      return obj.name != each;
    });
    searchKeys.every((item) => {
      return obj.children.some((each) => {
        if (each.name == item) {
          return remove(each, searchTxt);
        }
        return each.name == item;
      });
    });
  }
}

function findParent(data, count) {
  const len = selectionItem.treeAncestors.length;
  const parentName = selectionItem.treeAncestors[len - count].name;
  const foundItem = data.children.filter((itr) => {
    return itr.name == parentName;
  });
  if (selectionItem.data.name != parentName) {
    searchKeys.push(parentName);
  }
  if (foundItem.length) {
    return foundItem[0];
  } else {
    return findParent(data, ++count);
  }
}

document.getElementById('remove').addEventListener('click', () => {
  const optionObj = myChart.getOption();
  let data = optionObj.series[0].data[0];
  let isFound = remove(data, selectionItem.data.name);
  if (!isFound) {
    let parentObj = findParent(data, 1);
    del(searchKeys, parentObj, selectionItem.data.name);
  }
  searchKeys = [];
  myChart.setOption(optionObj);
});


