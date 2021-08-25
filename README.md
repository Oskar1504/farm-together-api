# pokemon scrapping
So i wanted to build an farm together calculator and needed data from all crops. I found just outdated lists so i build an small api which generates files by scraping the fandom farm together wiki.

A live version with current data is hosted at [http://projectlifetime.de/farmtogether/](http://projectlifetime.de/farmtogether/).

includes sorting according to all values that the crops have.
contains a lot of filter options.(season, growtime, crop types, exclude crops, hide table cols)

**Consider using the already scrapped data so u dont kill the fandom wiki server. Cause scraping is not welcomed.**

**this file contains all crops with image and data from fandom wiki =>  [all_Crops.json](./server/scrapped_data/all_Crops.json)**

## Usage
clone repository install dependencies and run api
```bash
Git clone https://github.com/Oskar1504/farm-together-api.git
npm install
npm run dev
```
go to [localhost:3001](http://localhost:3001) to use build in frontend interface.
includes sorting according to all values that the crops have. 
contains a lot of filter options.(season, growtime, crop types, exclude crops, hide table cols)

or download [server/scrapped_data/all_Crops.json](./server/scrapped_data/all_Crops.json) if u just want the data

## data format of [all_Crops.json](./server/scrapped_data/all_Crops.json)
```json
[
 {
    "name": "Carrot",
    "link": "/wiki/Carrot",
    "buy": "35",
    "harvest": "60 2",
    "time": "20m",
    "seasons": [
      "Spring",
      "Fall",
      "Winter"
    ],
    "type": "Vegetables",
    "profit": [
      
    ],
    "requirements": [
      {
        "requirement": "Farm Level",
        "level": "1"
      }
    ],
    "image": {
      "url": "https://static.wikia.nocookie.net/farmtogether/images/c/c3/Carrot.png/revision/latest/scale-to-width-down/64",
      "urlBase64": base64dataString}
      ,
    "buyInt": 35,
    "buyExpInt": 0,
    "timeInt": 0.3333333333333333,
    "harvestInt": 60,
    "harvestExpInt": 2,
    "profitPerPlant": 25,
    "profitPerHour": 75
  },
  {...},
  ...
]
```

## Api usage
If u want to update data files clone the repository
```bash
Git clone https://github.com/Oskar1504/farm-together-api.git
```
Install dependencies
```bash
npm install
```
Run api
```bash
npm run dev
```
- Go to localhost:3001/api/ft/listItems/crops/fruits
- To scrap all crops with type fruits from the wiki
 
- If u want to generate new lists go to
localhost:3001/api/ft/list/crops
- To scrap all crops listed in the wiki

## API routes

| route | parameter | return | description | example |
|:-----:|:---------:|:------:|:-----------:|:-----------:|
| /api/ft/list/:type | crops/flowers/trees/ponds/animal | JSON string & write file | gathers all items listed in this categorie from the wiki | /api/ft/list/crops |
| /api/ft/item/:name | itemname (carrot,potato) | JSON string | gathers all information about a single item | /api/ft/item/carrot |
| /api/ft/listItems/:type | crops/flowers/trees/ponds/animal | JSON Array with type categories | return all categories listed in the before written file. Read from file (route 1) | /api/ft/listItems/crops |
| /api/ft/listItems/:type/:categorie | crops/flowers/trees/ponds/animal // Fruits for example | JSON string | gathers all information about all items in this categorie | /api/ft/listItems/crops/fruits |
| /api/ft/allItems/:type | crops/flowers/trees/ponds/animal  | JSON string | gathers all information about all items in this categorie | /api/ft/allItems/crops |


## workflow
- I using axios to get html String from url
- Using jsdom i convert response string into dom element
- Default querysellector scraps element data 
- Form Json object 
- Logs all requests


