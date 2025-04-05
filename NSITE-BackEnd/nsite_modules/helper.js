'use strict'
/* Do not forget to update the nsite_modules build version in package.json */
let minMax = {}


  function groupBy(conversions, property) {
    return conversions.reduce((acc, obj) => {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

module.exports = {
    // ---- get current date and time --------
    _currentTime: function () {
       /* var str = "";
        var currentTime = new Date()
        var month = currentTime.getMonth() + 1
        var day = currentTime.getDate()
        var year = currentTime.getFullYear()
        var hours = currentTime.getHours()
        var minutes = currentTime.getMinutes()
        var seconds = currentTime.getSeconds()
        str += month + "/" + day + "/" +  year + " - "
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        if (seconds < 10) {
            seconds = "0" + seconds
        }
        str += hours + ":" + minutes + ":" + seconds + " ";
        if(hours > 11){
            str += "PM"
        } else {
            str += "AM"
        }
        return str;*/
        return new Date().toLocaleString()
    },
// ----- not used anymore -------
    _minMax: function (id,value) {
        if (minMax.hasOwnProperty(id)){
            if (value < minMax[id].min.value){
                minMax[id].min.value = value
                minMax[id].min.timeStamp = this._currentTime()
            }
            if (value > minMax[id].max.value){
                minMax[id].max.value = value
                minMax[id].max.timeStamp = this._currentTime()
            }
        } else {
            minMax[id] = {}
            minMax[id].min = {}
            minMax[id].max = {}
            minMax[id].min.value = value
            minMax[id].min.timeStamp = this._currentTime()
            minMax[id].max.value = value
            minMax[id].max.timeStamp = this._currentTime()
        }
        return(minMax[id])
    },
    _log: function (...x) {
        x = x.join(' ')
        console.log(x,module.exports._currentTime())

        // send to log file here....
    },
    _copyObj: function(src) {
        let target = {};
        for (let prop in src) {
          if (src.hasOwnProperty(prop)) {
            // if the value is a nested object, recursively copy all it's properties
            if (module.exports._isObject(src[prop])) {
              target[prop] = module.exports._copyObj(src[prop]);
            } else {
              target[prop] = src[prop];
            }
          }
        }
        return target;
      },
      _isObject: function(obj){
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
      },
      isEmpty: function(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false
        }
        return true
    },
    nestGroupsBy: function(arr, properties){
        properties = Array.from(properties);
        
        if (properties.length === 1) {
        return groupBy(arr, properties[0]);
        }
        const property = properties.shift();
        var grouped = groupBy(arr, property);
        for (let key in grouped) {
        grouped[key] = module.exports.nestGroupsBy(grouped[key], Array.from(properties));
        }
        return grouped;
    },
    comparisonLookUp: {
        equal:              function(a, b) { return a == b },
        notEqual:           function(a, b) { return a != b },
        lessThan:           function(a, b) { return a < b },
        lessThanOrEqual:    function(a, b) { return a <= b },
        graterThan:         function(a, b) { return a > b },
        graterThanOrEqual:  function(a, b) { return a >= b },
        absolute:           function(a, b) { return true },
        between:function(a, v){
            a = a.split(/[!,?,.]/)
            let array = a.map(Number)
            if(v > array[0] && v < array[1]){
                return true
            } else {
                return false
            }
        },                          
        notBetween:function(a, v){
            a = a.split(/[!,?,.]/)
            let array = a.map(Number)
            if(v > array[0] && v < array[1]){
                return false
            } else {
                return true
            } 
        } 
    },
    mathOperation: {
        add:        function(a, b) { return a + b },
        subtract:   function(a, b) { return a - b },
        multiply:   function(a, b) { return a * b },
        divide:     function(a, b) { return a / b }
    }
}
