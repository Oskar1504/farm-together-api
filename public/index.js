
var app = new Vue({
    el: '#app',
    data: {
        gens:[],
        visibleGen:0
    },
    methods: {
        setVisibleGen:function (index) {
            this.visibleGen = index
        },
        setActive: function (index) {
            if(index == this.visibleGen){return 'active2'}
        },
        getImage : function (url){
            return "pokemon/gen-" + (this.visibleGen+1) + "/images/"+url.split("/").reverse()[0]
        }
    },
    created() {
        fetch('pokemon/all.json')
            .then(response => response.json())
            .then(data => this.gens = data);
    },
    computed:{

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
