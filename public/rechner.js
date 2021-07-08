
var app = new Vue({
    el: '#app',
    data: {
        rawCrops: [],
        visibleCols: ["image","name","time","buyInt","harvestInt","profitPerPlant","profitPerHour"],
        allowedCols:["image","name","type","time","timeInt","buyInt","buyExpInt","harvestInt","harvestExpInt","profitPerPlant","profitPerHour","seasons","requirements"],
        seasons:["Spring","Summer","Fall","Winter"],
        excludedCrops:[],
        excludedTypes:[],
        excludedSeasons:[],
        minGrowHours:0,
        maxGrowHours:9999
    },
    methods: {
        addVisibleCol: function(col){
            if(this.visibleCols.includes(col)){
                this.visibleCols.remove(col)
            }else{
                this.visibleCols.push(col)
            }
        },
        excludeCrop: function(cropname) {
            if (this.excludedCrops.includes(cropname)) {
                this.excludedCrops.remove(cropname)
            } else {
                this.excludedCrops.push(cropname)
            }
        },
        excludeType: function(type) {
            if (this.excludedTypes.includes(type)) {
                this.excludedTypes.remove(type)
            } else {
                this.excludedTypes.push(type)
            }
        },
        excludeSeason: function(type) {
            if (this.excludedSeasons.includes(type)) {
                this.excludedSeasons.remove(type)
            } else {
                this.excludedSeasons.push(type)
            }
        },
        sortCrops: function(art) {
            this.crops.sort(dynamicSort(art))
        },
        calculateBestCrop: function(){
            this.excludedCrops = []
            this.crops.sort(dynamicSort("-profitPerHour")).forEach((crop,index) => {
                let t = crop.timeInt
                if(!inRange(t,this.minGrowHours, this.maxGrowHours)){
                    this.excludeCrop(crop.name)
                }
            })
        }
    },
    created() {
        fetch('/api/getCrops')
            .then(response => response.json())
            .then(data => this.rawCrops = data);
    },
    computed:{
        crops: function(){
            this.rawCrops.forEach(crop=>{
                // musste ich machen weil ich oben iwie nutze und der dann ncohaml hier rein gegeangen ist
                if(Array.isArray(crop.seasons)){
                    crop.seasons = crop.seasons.join(",")
                    crop.type = crop.type.replace("link=https://farmtogether","Event")

                    if(crop.timeInt == undefined){crop.timeInt = 0}

                    try{crop.timeInt = parseInt(crop.timeInt.toFixed(2))}catch(e){}
                    try{crop.profitPerHour = parseInt(crop.profitPerHour.toFixed(2))}catch(e){}
                }
            })
            return this.rawCrops
        },
        types: function () {
            let o = []
            this.rawCrops.forEach(crop=>{
                if(!o.includes(crop.type) && crop.type != ""){
                    o.push(crop.type)
                }
            })
            return o
        }
    }
});

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


//https://stackoverflow.com/a/3955096
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function inRange(x, min, max) {
    return x >= min && x <= max;
}