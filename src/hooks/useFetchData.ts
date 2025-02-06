import axios from "axios";
import { useCallback, useState } from "react"
const LOADING_STATES = {
    NEUTRAL: "NEUTRAL",
    FETCHING: 'FETCHING',
    FETCHED: 'FETCHED',
    ERROR: 'ERROR'
} as const
type LoadingStates = typeof LOADING_STATES[keyof typeof LOADING_STATES] 

const useFetchData = (endpoint:string) => {
    const [loading, setLoading] = useState<LoadingStates>(LOADING_STATES.NEUTRAL);
    const [data, setData] = useState();

    const fetchData = useCallback( async ()=> {
        const response = await axios.get(endpoint);

        if(response.status !== 200) {
            setLoading(LOADING_STATES.ERROR)
            return
        }
        setData(response.data);

    }, [endpoint])

    return {fetchData, loading, data}
}

export default useFetchData