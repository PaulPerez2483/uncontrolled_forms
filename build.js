const { Component } = React;
const { render } = ReactDOM;
const root = document.getElementById("root");

const API = "https://acme-users-api-rev.herokuapp.com/api";

const fetchUser = async () => {
	const storage = window.localStorage;
	const userId = storage.getItem("userId");
	if (userId) {
		try {
			return (await axios.get(`${API}/users/detail/${userId}`)).data;
		} catch (ex) {
			storage.removeItem("userId");
			return fetchUser();
		}
	}
	const user = (await axios.get(`${API}/users/random`)).data;
	storage.setItem("userId", user.id);
	return user;
};

const Loading = () => {
	return (
		<section id='loader'>
			<div className='lds-roller'>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</section>
	);
};

const Header = (props) => {
	const { user, following } = props;
	let numsFollowers = following.length;
	return (
		<section className='heading'>
			<h1>Acme Company Follower</h1>
			<p>{`You ( ${user.fullName}) ${
				numsFollowers > 1
					? `are following ${numsFollowers}`
					: `is following ${following.length} `
			}`}</p>
		</section>
	);
};

const Form = (props) => {
	const { following, companies, onUpdate } = props;
	let massagedData = companies.map((c) => {
		return { name: c.name, id: c.id, followingId: "", rating: 0 };
	});
	massagedData.forEach((el) => {
		following.forEach((x) => {
			if (el.id === x.companyId) {
				el.rating = x.rating;
				el.followingId = x.id;
			}
		});
	});

	return (
		<section className='form-holder'>
			{massagedData.map((item, idx) => {
				return (
					<div
						className={`parent_selector ${item.rating ? "favorite" : null}`}
						key={idx}>
						<label key={item.id} htmlFor={item.id}>
							{item.name}
						</label>
						<select
							value={item.rating}
							onChange={(e) => onUpdate(e.target.value, item)}>
							{["--not rated yet--", 1, 2, 3, 4, 5].map((num) => (
								<option key={num}>{num}</option>
							))}
						</select>
					</div>
				);
			})}
		</section>
	);
};

class App extends Component {
	constructor() {
		super();
		this.state = {
			user: [],
			companies: [],
			following: [],
			loading: true
		};
		this.onUpdate = this.onUpdate.bind(this);
	}

	async onUpdate(change, item) {
		const { id } = this.state.user;
		console.log(change);
		console.log(item);
		if (item.rating === 0) {
			let posting = (
				await axios.post(`${API}/users/${id}/followingCompanies`, {
					rating: change,
					companyId: item.id
				})
			).data;

			this.setState({ following: this.state.following.concat(posting) });
		} else if (item.rating !== change && change !== "--not rated yet--") {
			let update = (
				await axios.put(
					`${API}/users/${id}/followingCompanies/${item.followingId}`,
					{
						rating: change
					}
				)
			).data;
			this.setState({ following: this.state.following.concat(update) });
		} else {
			console.log("delete me");
			let deleteMe = (
				await axios.delete(
					`${API}/users/${id}/followingCompanies/${item.followingId}`
				)
			).data;
			this.setState({ following: this.state.following.concat(deleteMe) });
		}

		// POST /api/users/:userId/followingCompanies
		// PAYLOAD { rating: number, companyId: UUID }

		// returns the created following
		// PUT /api/users/:userId/followingCompanies/:followingId
		// PAYLOAD { rating: number }

		// returns the updated following
		// DELETE /api/users/:userId/followingCompanies/:followingId
		// returns nothing
	}

	componentDidMount() {
		const fetchingData = async () => {
			try {
				const user = await fetchUser();
				const companies = (await axios.get(`${API}/companies`)).data;
				const following = (
					await axios.get(`${API}/users/${user.id}/followingCompanies`)
				).data;
				// console.log(user.id);
				// console.log(following);
				// console.log(companies);
				this.setState({
					user,
					companies,
					following,
					loading: !this.state.loading
				});
			} catch (err) {
				// console.log(err)
			}
		};

		fetchingData();
	}
	render() {
		const { user, companies, following, loading } = this.state;

		if (loading) return <Loading />;
		// console.log(user);
		// console.log(companies);
		// console.log(following);
		console.log(loading);
		return (
			<main>
				<Header user={user} following={following} />
				<Form
					following={following}
					companies={companies}
					onUpdate={this.onUpdate}
				/>
			</main>
		);
	}
}

render(<App />, root);
