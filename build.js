const { Component } = React;
const { render } = ReactDOM;
const root = document.getElementById('root');

const API = 'https://acme-users-api-rev.herokuapp.com/api';

const fetchUser = async ()=> {
  const storage = window.localStorage;
  const userId = storage.getItem('userId'); 
  if(userId){
    try {
      return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
      storage.removeItem('userId');
      return fetchUser();
    }
  }
  const user = (await axios.get(`${API}/users/random`)).data;
  storage.setItem('userId', user.id);
  return  user;
};

const Loading = () => {
    return (
       <section id="loader">
        <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
       </section>
    )
}

const Header = (props) => {
    const {user, following} = props;
    let numsFollowers = following.length;
    return(
        <section className="heading">
            <h1>Acme Company Follower</h1>
            <p>{`You ( ${user.fullName}) ${ numsFollowers > 1 
                    ? `are following ${numsFollowers}` 
                    : `is following ${following.length} `}`}</p>
        </section>
    )
}


class Form extends Component {
    constructor(props){
        super(props);
        this.state ={
            val:null,
            massagedData: [],
            loading: true
        }
    }

    componentDidMount(){
        const {following, companies} = this.props
        let massagedData = companies.map(c => {
                     return {name: c.name, id: c.id, rating:0};
                });  
        massagedData.forEach(el => {
                    following.forEach(x => {
                    if (el.id === x.companyId) el.rating = x.rating});
                           
            });
            this.setState({
                massagedData,
                loading: !this.state.loading
            });      
    }
    render(){
        const {massagedData, loading} = this.state;
        // console.log(this.props.children)
        if (loading) return this.props.children;
        // console.log(massagedData);
        return(
            <section className="form-holder">
                     {
                         massagedData.map( (item, idx) => {
                             return(
                             <div className={`parent_selector ${item.rating ? 'favorite' : null}`} key={idx}>
                             <label key={item.id} htmlFor={item.id}>{item.name}</label>
                             <select value={item.rating} onChange={(e) => onUpdate(e.target.value)}>
                             {
                                 ['--not rated yet--', 1,2,3,4,5].map(num => <option key={num}>{num }</option>)
                             }
                             </select>
                             </div>
                             )
                         })
                    }
                </section>
        )
    }
}


   

class App extends Component{
    constructor(){
        super();
        this.state ={
            user: [],
            companies: [],
            following:[],
            loading: true
        }
    }
    componentDidMount(){
        const fetchingData = async() => {
            try{
                const user = await fetchUser();
                const companies = ( await axios.get(`${API}/companies`)).data;
                const following = ( await axios.get(`${API}/users/${user.id}/followingCompanies`)).data;
                // console.log(user.id);
                // console.log(following);
                // console.log(companies);
                this.setState({
                    user,
                    companies, 
                    following, 
                    loading: !this.state.loading,
                });
            }
            catch(err){
                // console.log(err)
            }
        }

        fetchingData()
    }
    render(){
        const {user, companies, following, loading} = this.state;
  
        if (loading) return <Loading />
        // console.log(user);
        // console.log(companies);
        // console.log(following);
        console.log(loading);
        return (
            <main>
                <Header user={user} following={following} />
                <Form following={following} companies={companies}>
                    <Loading/>
                </Form>
            </main>
        );
    }
}


render(<App />, root);