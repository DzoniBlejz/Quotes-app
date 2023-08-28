import React, { useState } from "react";
import "./Quote.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import DeleteQuote from "../modals/DeleteQuote";

const Quote = ({
	id,
	content,
	authorName,
	upvotesCount,
	downvotesCount,
	givenVote,
	onDelete,
}) => {
	const storedVote = localStorage.getItem(`vote_${id}`);

	const [vote, setVote] = useState(storedVote || givenVote);
	const [upVotesCount, setUpVotesCount] = useState(upvotesCount);
	const [downVotesCount, setDownVotesCount] = useState(downvotesCount);

	const totalPercent = 100;
	const percentPerVote = totalPercent / (upVotesCount + downVotesCount);
	const upvotesPercent =
		upVotesCount === 0 ? 0 : Math.round(upVotesCount * percentPerVote);

	let classBtnVote1 = vote === "upvote" ? "upvote-class" : "vote-class";
	let classBtnVote2 = vote === "downvote" ? "downvote-class" : "vote-class";

	const color =
		upvotesPercent <= 20
			? "color1"
			: upvotesPercent > 20 && upvotesPercent <= 40
			? "color2"
			: upvotesPercent > 40 && upvotesPercent <= 60
			? "color3"
			: upvotesPercent > 60 && upvotesPercent <= 80
			? "color4"
			: upvotesPercent > 80 && upvotesPercent <= 95
			? "color5"
			: "color6";

	const postVote = (newVoteType) => {
		if (vote === newVoteType) {
			console.log("You have already voted for this quote.");
			return;
		}

		axios
			.put(
				`https://quotes-app-johnny.onrender.com/quotes/${id}/vote`,
				{ voteType: newVoteType },
				{
					headers: {
						Authorization: "Bearer " + localStorage.getItem("accessToken"),
					},
				}
			)
			.then((response) => {
				const updatedQuote = response.data;
				setUpVotesCount(updatedQuote.upvotesCount);
				setDownVotesCount(updatedQuote.downvotesCount);
				setVote(newVoteType);
				toast("Vote updated successfully!", {
					icon: "👍",
					style: {
						borderRadius: "0.8rem",
						backgroundColor: "#4e7768",
						color: "#f0fffa",
						boxShadow:
							"rgba(0, 0, 0, 0.6) 0px 4px 6px -1px, rgba(0, 0, 0, 0.2) 0px 2px 4px -1px",
					},
				});
			})
			.catch((error) => {
				console.error("Error updating vote:", error);
			});
	};

	return (
		<div className="quote">
			<div className="left">
				<button
					className={`btn2 ${classBtnVote1} tooltip`}
					onClick={() =>
						vote === "upvote" ? postVote("none") : postVote("upvote")
					}
					disabled={vote === "downvote"}
				>
					&#129081;
				</button>
				<p className={`percent ${color}`}>{upvotesPercent}%</p>
				<p className="ratio">
					{upVotesCount} / {downVotesCount}
				</p>
				<button
					className={`btn2 ${classBtnVote2} tooltip`}
					onClick={() =>
						vote === "downvote" ? postVote("none") : postVote("downvote")
					}
					disabled={vote === "upvote"}
				>
					&#129083;
				</button>
			</div>
			<div className="right">
				<div style={{ marginLeft: "auto" }}>
					<DeleteQuote id={id} onDeleteQuote={onDelete} />
				</div>

				<p className="content">{content}</p>
				<p className="author">Author: {authorName}</p>
			</div>
		</div>
	);
};

export default Quote;
