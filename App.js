import { useEffect, useState } from 'react';
import './App.css';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

const GET_FLIGHTS = `query MyQuery {
  getFlights(direction: "dep", page_size: "12") {
    flights {
      flight_number
      flight_status
      flight_type
      airline
      flight_type
    }
  }
}
`;

const FLIGHT_UPDATES = `subscription MySubscription {
  flightUpdates {
    flight_number
    flight_status
    flight_type
    airline
    flight_type
    direction
  }
}
`;

function App() {

  const [flights, setFlights] = useState([])
  const [updateflights, setUpdateflights] = useState([])

  useEffect(() => {
    const fetchData = async () => {

      const flights = await API.graphql(graphqlOperation(GET_FLIGHTS));
      console.log('get flights');
      console.log(flights);
      setFlights(flights?.data?.getFlights?.flights)
    };

    fetchData()
      .catch(console.error);;
  }, [])

  useEffect(() => {
    console.log('subscribing man...')

    let subscription = null;

    const subsData = async () => {
      subscription = API.graphql(
        graphqlOperation(FLIGHT_UPDATES)
      ).subscribe({
        next: ({ provider, value }) => {
          console.log('getting something from subscription');
          console.log({ provider, value });
          const updatedFlightsSet = [...updateflights, ...(value?.data?.flightUpdates || [])].filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.flight_number === value.flight_number
            ))
          );
          setUpdateflights(updatedFlightsSet)

        },
        error: (error) => {
          console.log('Error subs!!!')
          console.warn(error);
        }
      });

    };

    subsData()
      .catch(console.error);

    return function cleanup() {
      if (subscription){
        subscription.unsubscribe();
      }
    };

  }, [])


  return (
    <div className="App">
      <div>
        Flights data
        {
          flights?.map((flight) => {
            return (
              <div key={flight.flight_number} style={{color: "red"}}>
                <span>{flight.flight_number} | </span>
                <span>{flight.flight_type} | </span>
                <span>{flight.flight_status} | </span>
                <span>{flight.airline}</span>
              </div>
            )
          })
        }
      </div>
      <div>
        Updates....
        {
          updateflights?.map((flight) => {
            return (
              <div key={flight.flight_number} style={{color: "green"}}>
                <span>{flight.flight_number} | </span>
                <span>{flight.flight_type} | </span>
                <span>{flight.flight_status} | </span>
                <span>{flight.airline}</span>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

export default App;
