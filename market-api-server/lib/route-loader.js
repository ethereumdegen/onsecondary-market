 
 
export default class RouteLoader {
    static loadRoutes(expressApp, routesConfig, controllerClass){

        for(let route of routesConfig){ 
            RouteLoader.configureRoute(expressApp, route, controllerClass)
        }

    }


    static configureRoute(expressApp, route, controllerClass){

        console.log('configuring route', route)
 
        if(route.length != 2){
            throw("Error: invalid route format")
        }

        let fullURI = route[0]
        let methodName = route[1]

        if(typeof fullURI != 'string' || typeof methodName != 'string'){
            throw("Error: invalid route format")
        }

        let restAction = fullURI.split(" ")[0]
        let endpointURI = fullURI.split(" ")[1]

        if(typeof restAction != 'string' || typeof endpointURI != 'string'){
            throw("Error: invalid route format")
        }

        restAction = restAction.toLowerCase()

        if(restAction == 'get'){
            expressApp.get(endpointURI, async (req, res) => {
                return await controllerClass[methodName](req,res)
            })
        } 

        if(restAction == 'post'){
            expressApp.post(endpointURI, async (req, res) => {
                return await controllerClass[methodName](req,res)
            })
        } 


    }
}




 


 