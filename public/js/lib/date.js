var ZDate = {};

//format: 年 - yy/yyyy，月 - mm，天 - dd, 小时：hh，分钟 - MM，秒 - s, 分秒 - ms
ZDate.format = function(date, format){
	if(date.toString().indexOf('-') > 0){
        date = date.toString().replace(/-/g, '/');
    }

    var reg = {
        yyyy: 'year',
        hh: 'hours',
        mm: 'month',
        dd: 'date',
        hh: 'hours',
        MM: 'minites',
        ss: 'seconds',
        ms: 'millSeconds'
    }
    
    var date = new Date(date);
    var model = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: date.getHours(),
        minites: date.getMinutes(),
        seconds: date.getSeconds(),
        millSeconds: date.getMilliseconds()
    }

    if(!format){
        return model.year + '-' + model.month + '-' + model.date;
    }

    for(var key in reg){
        var param = reg[key];
        var val = model[param];
        if(val.toString().length < 2){
        	val = '0' + val.toString();
        }
        format = format.replace(key, val);
    }

    return format;
}

//date format: yyyy-MM-dd
ZDate.compare = function(date1, date2){
    if(typeof date1 == "string"){
        date1 = date1.replace(/-/g, '/');
    }
    if(typeof date2 == "string"){
        date2 = date2.replace(/-/g, '/');
    }

    var date1 = new Date(date1).getTime();
    var date2 = new Date(date2).getTime();

    return date1 - date2;
}   


module.exports = ZDate;