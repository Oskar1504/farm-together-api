# farm-together-api
So i wanted to build an farm together calculator and needed data from all crops. I found just outdated lists so i build an small api which generates files by scraping the fandom farm together wiki.

Consider downloading the  scapped_data.zip  .
This zip includes all crops and flowers. Since tree's havent a unifies page layout (wiki pages) the scrapper wont work properly.(Modify server/routes/index.js to make changes)

Just use the already scrapped data so u dont kill the fandom wiki server. Cause scraping is not welcomed.

## Usage
Download scrapped_data.zip or clone repository and copy server/scrapped_data folder

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


## workflow
- I using axios to get html String from url
- Using jsdom i convert response string into dom element
- Default querysellector scraps element data 
- Form Json object 
- Logs all requests
