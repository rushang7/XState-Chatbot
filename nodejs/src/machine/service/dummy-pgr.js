const getCityAndLocality = require('./util/google-maps-util');

class DummyPGRService {

    // Please mark the method async if the actual app-service method would involve api calls

    async fetchCities() {
        return this.cities.tenantInfo.map(el=>el.code);
        // let tenantId = this.cities.tenantId;
        // return this.cities.tenantInfo.map(el=>el.code.replace(`${tenantId}.`, ""));
    }
    async getCityAndLocality(event) {
        let messageType = event.message.type;
        if(messageType !== 'location') {
            console.log('Not a geocode');
            return {};
        }
        let geocode = event.message.input;
        let latlng = geocode.substring(1, geocode.length - 1); // Remove braces
        let cityAndLocality = await getCityAndLocality(latlng);
        return cityAndLocality;
    }
    async fetchComplaintItemsForCategory(category) {
        return this.complaintCategoryToItemsMap[category];
    }
    async fetchComplaintCategories() {
        return Object.keys(this.complaintCategoryToItemsMap);
    }
    async fetchFrequentComplaints() {
        //  throw new Error(400); // Use for testing, throws an error to simulate service call error path
        // return [
        //     {code: 'NoStreetlight', value: 'NoStreetlight'},
        //     {code: 'StreetLightNotWorking', value: 'StreetLightNotWorking'},
        //     {code: 'GarbageNeedsTobeCleared', value: 'GarbageNeedsTobeCleared'},
        //     {code: 'DamagedGarbageBin', value: 'DamagedGarbageBin'},
        //     {code: 'BurningOfGarbage', value: 'BurningOfGarbage'},
        // ];
        return [
            'StreetLightNotWorking',
            'BlockOrOverflowingSewage',
            'GarbageNeedsTobeCleared',
            'BrokenWaterPipeOrLeakage'
        ]
    }
    async persistComplaint(bundle) {
        console.log(`Saving complaint ${bundle} to database`);
    }
    constructor() {
        // 11 November, 2020
        //https://github.com/egovernments/egov-mdms-data/blob/master/data/pb/RAINMAKER-PGR/ServiceDefs.json
        this.complaint_meta_data = {
            "tenantId": "pb",
            "moduleName": "RAINMAKER-PGR",
            "ServiceDefs": [
            {
                "serviceCode": "NoStreetlight",
                "keywords": "streetlight, light, repair, work, pole, electric, power, repair, damage, fix",
                "department": "Streetlights",
                "slaHours": 336,
                "menuPath": "StreetLights",
                "active": false,
                "order": 1
            },
            {
                "serviceCode": "StreetLightNotWorking",
                "keywords": "streetlight, light, repair, work, pole, electric, power, repair, fix",
                "department": "DEPT_1",
                "slaHours": 336,
                "menuPath": "StreetLights",
                "active": true,
                "order": 2
            },
            {
                "serviceCode": "GarbageNeedsTobeCleared",
                "keywords": "garbage, collect, litter, clean, door, waste, remove, sweeper, sanitation, dump, health, debris, throw",
                "department": "DEPT_25",
                "slaHours": 336,
                "menuPath": "Garbage",
                "active": true,
                "order": 3
            },
            {
                "serviceCode": "DamagedGarbageBin",
                "keywords": "garbage, waste, bin, dustbin, clean, remove, sanitation, overflow, smell, health, throw, dispose",
                "department": "DEPT_25",
                "slaHours": 336,
                "menuPath": "Garbage",
                "active": true,
                "order": 4
            },
            {
                "serviceCode": "BurningOfGarbage",
                "keywords": "garbage, remove, burn, fire, health, waste, smoke, plastic, illegal",
                "department": "DEPT_25",
                "slaHours": 336,
                "menuPath": "Garbage",
                "active": true,
                "order": 5
            },
            {
                "serviceCode": "OverflowingOrBlockedDrain",
                "keywords": "drain, block, clean, debris, silt, drainage, water, clean, roadside, flow, remove, waste, garbage, clear, overflow, canal, fill, stagnate, rain, sanitation, sand, pipe, clog, stuck",
                "department": "ENG",
                "slaHours": 336,
                "menuPath": "Drains",
                "active": true
            },
            {
                "serviceCode": "illegalDischargeOfSewage",
                "keywords": "water, supply, connection, damage, repair, broken, pipe, piping, tap",
                "department": "ENG",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "BlockOrOverflowingSewage",
                "keywords": "water, supply, connection, damage, repair, broken, pipe, piping, tap",
                "department": "ENG",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "ShortageOfWater",
                "keywords": "water, supply, shortage, drink, tap, connection,leakage,less",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "NoWaterSupply",
                "keywords": "water, supply, connection, drink, tap",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "DirtyWaterSupply",
                "keywords": "water, supply, connection, drink, dirty, contaminated, impure, health, clean",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "BrokenWaterPipeOrLeakage",
                "keywords": "water, supply, connection, damage, repair, broken, pipe, piping, tap",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "WaterPressureisVeryLess",
                "keywords": "water, supply, connection, damage, repair, broken, pipe, piping, tap",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "WaterandSewage",
                "active": true
            },
            {
                "serviceCode": "DamagedRoad",
                "keywords": "road, damage, hole, surface, repair, patch, broken, maintenance, street, construction, fix",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "RoadsAndFootpaths",
                "active": true
            },
            {
                "serviceCode": "WaterLoggedRoad",
                "keywords": "road, drainage, water, block, puddle, street, flood, overflow, rain",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "RoadsAndFootpaths",
                "active": true
            },
            {
                "serviceCode": "ManholeCoverMissingOrDamaged",
                "keywords": "road, street, manhole, hole, cover, lid, footpath, open, man, drainage, damage, repair, fix",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "RoadsAndFootpaths",
                "active": true
            },
            {
                "serviceCode": "DamagedOrBlockedFootpath",
                "keywords": "footpath, repair, broken, surface, damage, patch, hole, maintenance, walk, path",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "RoadsAndFootpaths",
                "active": true
            },
            {
                "serviceCode": "ConstructionMaterialLyingOntheRoad",
                "keywords": "illegal, shop, footpath, walk, remove, occupy, path",
                "department": "DEPT_4",
                "slaHours": 336,
                "menuPath": "RoadsAndFootpaths",
                "active": true
            },
            {
                "serviceCode": "RequestSprayingOrFoggingOperation",
                "keywords": "mosquito, menace, fog, spray, kill, health, dengue, malaria, disease, clean",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "Mosquitos",
                "active": true
            },
            {
                "serviceCode": "StrayAnimals",
                "keywords": "stray, dog, dogs, menace, animal, animals, attack, attacking, bite, biting, bark, barking",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "Animals",
                "active": true
            },
            {
                "serviceCode": "DeadAnimals",
                "keywords": "stray, cow, cows, cattle, bull, bulls, graze, grazing, dung, menace",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "Animals",
                "active": true
            },
            {
                "serviceCode": "DirtyOrSmellyPublicToilets",
                "keywords": "toilet, public, restroom, bathroom, urinal, smell, dirty",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "PublicToilets",
                "active": true
            },
            {
                "serviceCode": "PublicToiletIsDamaged",
                "keywords": "toilet, public, restroom, bathroom, urinal, block, working",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "PublicToilets",
                "active": true
            },
            {
                "serviceCode": "NoWaterOrElectricityinPublicToilet",
                "keywords": "toilet, public, restroom, bathroom, urinal, electricity, water, working",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "PublicToilets",
                "active": true
            },
            {
                "serviceCode": "IllegalShopsOnFootPath",
                "keywords": "illegal, shop, footpath, violation, property, public, space, land, unathourised, site, construction, wrong",
                "department": "DEPT_6",
                "slaHours": 336,
                "menuPath": "LandViolations",
                "active": true
            },
            {
                "serviceCode": "IllegalConstructions",
                "keywords": "illegal, violation, property, public, space, land, unathourised, site, construction, wrong, build",
                "department": "DEPT_6",
                "slaHours": 336,
                "menuPath": "LandViolations",
                "active": true
            },
            {
                "serviceCode": "IllegalParking",
                "keywords": "illegal, parking, car, vehicle, space, removal, road, street, vehicle",
                "department": "DEPT_6",
                "slaHours": 336,
                "menuPath": "LandViolations",
                "active": true
            },
            {
                "serviceCode": "IllegalCuttingOfTrees",
                "keywords": "tree, cut, illegal, unathourized, remove, plant",
                "department": "DEPT_5",
                "slaHours": 336,
                "menuPath": "Trees",
                "active": true
            },
            {
                "serviceCode": "CuttingOrTrimmingOfTreeRequired",
                "keywords": "tree, remove, trim, fallen, cut, plant, branch",
                "department": "DEPT_5",
                "slaHours": 336,
                "menuPath": "Trees",
                "active": true
            },
            {
                "serviceCode": "OpenDefecation",
                "keywords": "open, defecation, waste, human, privy, toilet",
                "department": "DEPT_3",
                "slaHours": 336,
                "menuPath": "OpenDefecation",
                "active": true
            },
            {
                "serviceCode": "ParkRequiresMaintenance",
                "keywords": "open, defecation, waste, human, privy, toilet",
                "department": "DEPT_5",
                "slaHours": 336,
                "menuPath": "Parks",
                "active": true
            },
            {
                "serviceCode": "Others",
                "keywords": "other, miscellaneous,ad,playgrounds,burial,slaughterhouse, misc, tax, revenue",
                "department": "DEPT_10",
                "slaHours": 336,
                "menuPath": "",
                "active": true,
                "order": 6
            }
            ]
        };
        this.cities = {
            "tenantId": "pb",
            "moduleName": "tenant",
            "tenantInfo": [
                {
                "code": "pb.jalandhar",
                "districtCode": "Barnala",
                "population": "156716",
                "malePopulation": "82045",
                "femalePopultion": "74671",
                "workingPopulation": "37.2",
                "literacyRate": "79.2",
                "languagesSpoken": ["PN", "HN", "EN"]
                },
                {
                "code": "pb.amritsar",
                "districtCode": "Bahadaur",
                "population": "116449",
                "malePopulation": "62554",
                "femalePopultion": "53895",
                "workingPopulation": "35.01",
                "literacyRate": "69.46",
                "languagesSpoken": ["PN", "GR", "HN"]
                },
            
                {
                "code": "pb.patankot",
                "districtCode": "Dhanaula",
                "population": "17331",
                "malePopulation": "10521",
                "femalePopultion": "6810",
                "workingPopulation": "33.48",
                "literacyRate": "62.63",
                "languagesSpoken": ["GR", "PN", "HN"]
                },
                {
                "code": "pb.nawanshahr",
                "districtCode": "Dhanaula",
                "population": "12507",
                "malePopulation": "6810",
                "femalePopultion": "5697",
                "workingPopulation": "33.70",
                "literacyRate": "57.41",
                "languagesSpoken": ["HN", "PN", "EN"]
                }
            ]
        };
        this.complaintCategoryToItemsMap = {};
        this.complaint_meta_data.ServiceDefs.forEach(el=> {
            if (this.complaintCategoryToItemsMap[el.menuPath]) {
                this.complaintCategoryToItemsMap[el.menuPath].push(el.serviceCode);
            } else {
                this.complaintCategoryToItemsMap[el.menuPath] = [el.serviceCode];
            }
        });
    } // constructor
}
module.exports = new DummyPGRService();