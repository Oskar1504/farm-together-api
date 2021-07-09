const colors = [
    [120,28,129],
    [64,67,153],
    [72,139,194],
    [107,178,140],
    [159,190,87],
    [210,179,63],
    [231,126,49],
    [217,33,32]
]

var app = new Vue({
    el: '#app',
    data: {
        time:5,
        kAnfang:100,
        maxCrops:100,
        rawCrops:[],
        visibleCrops:[],
        test:[]
    },
    methods: {
        start: function(){
            if(this.visibleCrops.length > 0){

                myChart.data.labels = Array.from({length: parseInt(app._data.time)}, (v, k) => k+1)
                myChart.data.datasets = []
                let count = 0
                for(crop of this.crops){
                    if(this.visibleCrops.includes(crop.name)){
                        addCrop(crop,count)
                        count += 1
                    }
                }
                myChart.update()

                //adds endergebnisse
                let len = myChart.data.datasets.length
                this.test = []
                for(let i = 0;i < len; i+=2){
                    this.test.push({name:myChart.data.datasets[i].label.split(" ")[1],k:myChart.data.datasets[i].data[this.time-1],a:myChart.data.datasets[i+1].data[this.time-1]})
                }
            }
        },
        addVisibleCrop: function(cropname) {
            if(this.visibleCrops.length > 6){this.visibleCrops.shift()}
            if (this.visibleCrops.includes(cropname)) {
                this.visibleCrops.remove(cropname)
            } else {
                this.visibleCrops.push(cropname)
            }
            this.start()
        }
    },
    created() {
        fetch('/api/getCrops')
            .then(response => response.json())
            .then(data => this.rawCrops = data);
    },
    computed: {
        crops: function () {
            this.rawCrops.forEach(crop => {
                // musste ich machen weil ich oben iwie nutze und der dann ncohaml hier rein gegeangen ist
                if (Array.isArray(crop.seasons)) {
                    crop.seasons = crop.seasons.join(",")
                    crop.type = crop.type.replace("link=https://farmtogether", "Event")

                    if (crop.timeInt == undefined) {
                        console.log(crop.name,"changed time to 0")
                        crop.timeInt = 0
                    }

                    // try {
                    //     crop.timeInt = parseInt(crop.timeInt.toFixed(2))
                    // } catch (e) {
                    // }
                    // try {
                    //     crop.profitPerHour = parseInt(crop.profitPerHour.toFixed(2))
                    // } catch (e) {
                    // }
                }
            })
            return this.rawCrops
        }
    }
});



const data = {
    labels: Array.from({length: parseInt(app._data.time)}, (v, k) => k+1) ,
    datasets: [
    ]
};

var ctx = document.getElementById('myChart')
var myChart = new Chart(ctx, {
    type: 'line',
    data,
    options: {
        scales: {
            yAxes: [
                {
                    id: 'A',
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'kapital'
                    }
                },
                {
                    id: 'B',
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'anzahl crops'
                    },
                    ticks:{
                        max:parseInt(app._data.maxCrops),
                        min:0
                    }
                }
            ]
        }
    }
});

function calculate() {
    myChart.data.labels = Array.from({length: parseint(app._data.time)}, (v, k) => k+1)
    myChart.data.datasets = []
    let count = 0


    app._data.rawCrops.forEach(crop=>{
        console.log(crop)
        if(app._data.visibleCrops.includes(crop.name)){
            addCrop(crop,count)
            count += 1
        }
    })

    // myChart.update()
}

function addCrop(crop,index){
    if(index > colors.length){index = colors.length}

    let kanfang = parseInt(app._data.kAnfang),
        maxcrops =  parseInt(app._data.maxCrops),
        a = [],
        k = [],
        amount = 0,
        timer = 1

    //first plant as much crops u can with starting capital
    amount = Math.floor(kanfang/crop.buyInt)
    if(amount >= maxcrops){amount = maxcrops}
    kanfang += amount*(crop.harvestInt-crop.buyInt)
    a.push(amount)
    k.push(kanfang)


    //iteratores over hours
    myChart.data.labels.forEach(h => {
        //calculates if in the time an crop full grown
        let harvestCycle = Math.floor(timer/crop.timeInt)


        //if no crop crown it adds an hour to the timer
        if(harvestCycle === 0){
            timer += 1
        }else{
            //when more than on cycle in an hour
            for(let i = 0; i < harvestCycle; i++){
                //how much crops u can buy
                amount = Math.floor(kanfang/crop.buyInt)
                //upper amount border
                if(amount >= maxcrops){amount = maxcrops}
                //adding profit to kapital
                kanfang += amount*(crop.harvestInt-crop.buyInt)
            }
            //reset timer 
            timer = 1
        }

        // console.log("crops",amount,"kapital",kanfang,"gewinn",amount*(crop.harvestInt-crop.buyInt))

        a.push(amount)
        k.push(kanfang)
    })

    //finally updates chart

    //adds capital set
    let set  = {
        label: 'Kapital '+crop.name,
            yAxisID: 'A',
        borderColor: 'rgb('+colors[index].join(",")+')',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        data: k,
        tension: 0.1
    }

    myChart.data.datasets.push(set)

    //adds amount set
    set  = {
        label: crop.name+' amount',
        yAxisID: 'B',
        borderColor: 'rgba('+colors[index].join(",")+',0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        data: a,
        tension: 0.1,
        borderDash: [10,5]
    }

    myChart.data.datasets.push(set)

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
