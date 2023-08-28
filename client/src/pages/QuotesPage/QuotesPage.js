import React, { useEffect, useState } from "react";
import axios from "axios";
import Quote from "../../components/Quote/Quote";
import "./QuotesPage.css";
import { Pagination, Select, MultiSelect } from "@mantine/core";
import AddQuote from "../../components/modals/AddQuote";

const QuotesPage = () => {
	const [quotes, setQuotes] = useState([]);
	const [activePage, setPage] = useState(1);
	const [valueFilter, setValueFilter] = useState([]);
	const [valueSelect, setValueSelect] = useState("createdAt");
	const [addQuote, setAddQuote] = useState(false);
	const [tags, setTags] = useState([]);
	const dataToShowFilter = tags.map((tag) => {
		return {
			value: tag,
			label: `${tag[0].toUpperCase()}${tag.slice(1, tag.length)}`,
		};
	});

	const dataSort = [
		{ value: "createdAt", label: "Date of create" },
		{ value: "downvotesCount", label: "Down Votes Count" },
		{ value: "upvotesCount", label: "Up Votes Count" },
	];
	const sortDirection =
		valueSelect === "author" || valueSelect === "content" ? "asc" : "desc";

	useEffect(() => {
		axios
			.get(`https://quotes-app-johnny.onrender.com/quotes`, {
				params: {
					page: activePage,
					author: null,
					tags: valueFilter.join(","),
					sort: valueSelect === "date" ? "createdAt" : valueSelect,
					sortDirection: sortDirection === "asc" ? "asc" : "desc",
				},
			})
			.then((response) => {
				setQuotes(response.data);
				const tagsFromResponse = response.data.flatMap((quote) => quote.tags);
				const uniqueTags = [...new Set(tagsFromResponse)];
				setTags(uniqueTags);
			})
			.catch((error) => {
				console.error("Greška pri dobavljanju citata:", error);
			});
	}, [activePage, valueFilter, valueSelect, sortDirection, addQuote]);

	const deleteQuoteAndUpdateList = (id) => {
		axios
			.delete(`https://quotes-app-johnny.onrender.com/quotes/${id}`)
			.then(() => {
				// Osvežavanje liste citata nakon brisanja
				setQuotes((prevQuotes) =>
					prevQuotes.filter((quote) => quote.id !== id)
				);
			})
			.catch((error) => {
				console.error("Error deleting quote:", error);
			});
	};

	return (
		<div className="quotes">
			<div className="quotes-func">
				<Select
					label="Sort Quotes by:"
					placeholder="Select a Property"
					data={dataSort}
					value={valueSelect}
					onChange={setValueSelect}
					clearable
				/>
				<MultiSelect
					style={{ maxWidth: "50%" }}
					data={dataToShowFilter}
					label="Select tags to filter Quotes:"
					placeholder="Pick tags that you like"
					value={valueFilter}
					onChange={setValueFilter}
					nothingFound="Nothing found"
					clearButtonLabel="Clear selection"
					clearable
				/>
				<AddQuote render={setAddQuote} />
			</div>
			{quotes.map((quote) => (
				<Quote
					key={quote._id}
					content={quote.content}
					authorName={quote.author}
					upvotesCount={quote.upvotesCount}
					downvotesCount={quote.downvotesCount}
					givenVote={quote.givenVote}
					id={quote._id}
					onDelete={deleteQuoteAndUpdateList}
				/>
			))}

			<Pagination
				className="pagination"
				page={activePage}
				onChange={setPage}
				onClick={window.scrollTo(0, 0)}
				total={5}
				color="teal"
				radius="md"
			/>
		</div>
	);
};

export default QuotesPage;
