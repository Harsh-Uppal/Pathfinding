const vec = (x, y) => {
    return {x, y, equals:(...other) => {
        let ret = false;
        other.forEach(o => {
            if(x == o.x && y == o.y) {
                ret = true;
                return true;
            }
        });
        return ret;
    }};
}

const dist = (v0, v1) => Math.sqrt(Math.pow(v0.x - v1.x, 2) + Math.pow(v0.y - v1.y, 2));