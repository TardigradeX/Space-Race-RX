

export const getStartFromMap = (map) => {return getCoordinatesForName(map, 'start');};

export const getFinishFromMap = (map) => {return getCoordinatesForName(map, 'finish');};

const getCoordinatesForName = (map, name) => {
    for (let object of map.objects.objects) {
        if(object.name == name) {
            return {x: object.x, y: object.y};
        }
    }
    return {x: 0, y: 0};
};