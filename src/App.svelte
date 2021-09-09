<script lang="ts">
	//#region IMPORTS
	import { onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { backInOut } from "svelte/easing";

	import { faCoffee } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";

	import type { ITracker } from "./models/ITracker";
	import type { ITrackerGroup } from "./models/ITrackerGroup";

	import { tick } from "./store";

	import Form from "./components/Form.svelte";
	import Menu from "./components/Menu.svelte";
	import TrackerGroup from "./components/TrackerGroup.svelte";
	import { formatDate, styleDate } from "./utils/date-fns";
	//#endregion

	let trackerGroups: ITrackerGroup[] = [];

	$: sum = trackerGroups.reduce((acc, tracker) => acc + tracker.duration, 0);
	$: sumFormatted = formatDate(sum);
	$: sumStyled = styleDate(sumFormatted);

	$: isAnyTrackerActive = trackerGroups.findIndex((t) => t.active) > -1;
	$: activeIcon = isAnyTrackerActive ? "🔴" : "⏸️";

	//#region TRACKING
	function stopTheCount(id?: string) {
		trackerGroups = [
			...trackerGroups.map((g) => {
				return {
					...g,
					trackers: [
						...g.trackers.map((t) => {
							if (t.id === id) {
								return { ...t, active: true };
							}
							return {
								...t,
								active: false,
							};
						}),
					],
				};
			}),
		];
		backup();
	}

	function handleDeleteTrackerGroup(deleteDetail: ITrackerGroup) {
		const { id } = deleteDetail;
		trackerGroups = trackerGroups.filter((t) => t.id !== id);
		backup();
	}

	function handleSubmitTrackerGroup(newTrackerGroup: ITrackerGroup) {
		trackerGroups = [newTrackerGroup as ITrackerGroup, ...trackerGroups];
		backup();
	}

	function handleTrackerGroupNameChanged({ name, id }) {
		const i = trackerGroups.findIndex((t) => t.id === id);
		if (i > -1) {
			trackerGroups[i].name = name;
		}
		backup();
	}

	function handleSubmitTracker(tracker: ITracker, id: string) {
		const i = trackerGroups.findIndex((t) => t.id === id);
		if (i > -1) {
			trackerGroups[i].trackers = [...trackerGroups[i].trackers, tracker];
		}
		backup();
	}

	function handleTrackerPropChanged({ key, value, trackerId, groupId }) {
		const gi = trackerGroups.findIndex((g) => g.id === groupId);
		if (gi > -1) {
			const ti = trackerGroups[gi].trackers.findIndex(
				(t) => t.id === trackerId
			);
			if (ti > -1) {
				trackerGroups[gi].trackers[ti][key] = value;
			}
		}
		backup();
	}

	function handleTrackerDeleted({ trackerId, groupId }) {
		const gi = trackerGroups.findIndex((g) => g.id === groupId);
		if (gi > -1) {
			trackerGroups[gi].trackers = trackerGroups[gi].trackers.filter(
				(t) => t.id !== trackerId
			);
		}
		backup();
	}
	//#endregion

	//#region BACKUP
	function backup() {
		localStorage.setItem(
			"backup",
			JSON.stringify({
				date: new Date().toISOString(),
				data: trackerGroups,
			})
		);
	}

	function restoreBackup() {
		const backup = JSON.parse(localStorage.getItem("backup"));
		if (backup) {
			console.log("Found backup", backup);
			const parsedTrackers: ITrackerGroup[] = backup.data;
			trackerGroups = parsedTrackers.map((g) => {
				return {
					...g,
					trackers: [
						...g.trackers.map((t) => ({ ...t, active: false })),
					],
				};
			});
		}
	}
	//#endregion

	function handleTrackerGroupDragStart(event, sourceIndex: number) {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.dropEffect = "move";
		event.dataTransfer.setData("trackerId", sourceIndex);
	}

	function handleTrackerGroupDrop(event, targetIndex: number) {
		event.dataTransfer.dropEffect = "move";
		const sourceIndex = Number(event.dataTransfer.getData("trackerId"));

		const newTrackers = trackerGroups;

		if (sourceIndex < targetIndex) {
			newTrackers.splice(targetIndex + 1, 0, newTrackers[sourceIndex]);
			newTrackers.splice(sourceIndex, 1);
		} else {
			newTrackers.splice(targetIndex, 0, newTrackers[sourceIndex]);
			newTrackers.splice(sourceIndex + 1, 1);
		}
		trackerGroups = newTrackers;

		backup();
	}

	function handleTrackerDragStart(
		event: any,
		trackerId: string,
		groupId: string
	) {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.dropEffect = "move";
		event.dataTransfer.setData("type", "tracker");
		event.dataTransfer.setData("trackerId", trackerId);
		event.dataTransfer.setData("groupId", groupId);
	}

	function handleTrackerDrop(
		event: DragEvent,
		targetTrackerId: string,
		targetGroupId: string
	) {
		if (event.dataTransfer.getData("tracker") !== "tracker") return;
		console.log("Tracker drop");

		event.dataTransfer.dropEffect = "move";
		const sourceTrackerId = event.dataTransfer.getData("trackerId");
		const sourceGroupId = event.dataTransfer.getData("groupId");

		const sourceGroupIndex = trackerGroups.findIndex(
			(g) => g.id === sourceGroupId
		);
		const targetGroupIndex = trackerGroups.findIndex(
			(g) => g.id === targetGroupId
		);

		const sourceTrackerIndex = trackerGroups[
			sourceGroupIndex
		].trackers.findIndex((g) => g.id === sourceTrackerId);
		const targetTrackerIndex = trackerGroups[
			targetGroupIndex
		].trackers.findIndex((g) => g.id === targetTrackerId);

		// swap in same Group
		if (sourceGroupId === targetGroupId) {
			const newTrackers = trackerGroups[sourceGroupIndex].trackers;

			if (sourceTrackerIndex < targetTrackerIndex) {
				newTrackers.splice(
					targetTrackerIndex + 1,
					0,
					newTrackers[sourceTrackerIndex]
				);
				newTrackers.splice(sourceTrackerIndex, 1);
			} else {
				newTrackers.splice(
					targetTrackerIndex,
					0,
					newTrackers[sourceTrackerIndex]
				);
				newTrackers.splice(sourceTrackerIndex + 1, 1);
			}
			trackerGroups[sourceGroupIndex].trackers = newTrackers;
		}

		backup();
	}

	onMount(() => {
		setInterval(() => {
			tick.update((t) => t + 1);
		}, 1000);
		restoreBackup();

		// window.onbeforeunload = function () {
		// 	return "Your tracker will stop working when you leave this page";
		// };
	});
</script>

<svelte:head>
	<title>JJ-Tracker - {sumFormatted} {activeIcon}</title>
</svelte:head>

<main class="w-full h-full px-2 py-1">
	<!-- HEADROW -->
	<div class="fixed z-10 w-full top-0 left-0 px-2 py-1">
		<header
			class="items-baseline px-4 py-2 uppercase bg-blue-600 text-gray-50 rounded flex flex-row justify-between bg-gradient-to-r dark:from-purple-600 dark:via-red-500 dark:to-yellow-400"
		>
			<div class="hidden md:block">
				Active trackings {trackerGroups.length}
			</div>

			<span>
				{@html sumStyled}
			</span>

			<!-- BUTTONS -->
			<div>
				<button
					on:click={() => stopTheCount()}
					class={`btn bg-red-500 hover:bg-red-400 uppercase border-none`}
					><Icon data={faCoffee} /><span
						class={`ml-1 hidden md:inline`}>Stop the Count</span
					></button
				>
				<Menu />
			</div>
		</header>
	</div>

	<!-- CONTENT -->
	<section class="pt-16 pb-14">
		<!-- TRACKER LIST -->
		<ul>
			{#each trackerGroups as trackerGroup, index (trackerGroup.id)}
				<div animate:flip={{ easing: backInOut, duration: 400 }}>
					<TrackerGroup
						{...trackerGroup}
						draggable={true}
						on:addTracker={(e) =>
							handleSubmitTracker(e.detail.tracker, e.detail.id)}
						on:nameChange={(e) =>
							handleTrackerGroupNameChanged(e.detail)}
						on:trackerPropChange={(e) =>
							handleTrackerPropChanged(e.detail)}
						on:trackerDelete={(e) => handleTrackerDeleted(e.detail)}
						on:trackerDragStart={(e) =>
							handleTrackerDragStart(
								e.detail.event.detail,
								e.detail.trackerId,
								e.detail.groupId
							)}
						on:trackerDrop={(e) =>
							handleTrackerDrop(
								e.detail.eventTTT.detail,
								e.detail.trackerId,
								e.detail.groupId
							)}
						on:stopCounting={(e) => stopTheCount(e.detail.id)}
						on:delete={(e) => handleDeleteTrackerGroup(e.detail)}
						on:dragstart={(e) =>
							handleTrackerGroupDragStart(e.detail, index)}
						on:drop={(e) => handleTrackerGroupDrop(e.detail, index)}
					/>
				</div>
			{/each}
		</ul>
	</section>

	<div class="fixed bottom-0 left-0 w-full px-8 py-4">
		<!-- NEW FORM -->
		<Form
			type="group"
			on:newTrackerGroup={(e) => handleSubmitTrackerGroup(e.detail.group)}
		/>
	</div>
</main>

<style>
	:global(*) {
		outline: none !important;
	}
	:global(body) {
		@apply bg-gray-200 dark:bg-gray-900;
	}
	:global(input:focus, textarea:focus, button:focus) {
		@apply ring;
	}

	:global(.btn) {
		/* general */
		@apply rounded-2xl px-4 py-2;
		/* general dark */
		@apply dark:text-gray-100;
		/* disabled */
		@apply disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-500 !important;
		/* disabled dark */
		@apply dark:disabled:bg-gray-700 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-400 !important;
	}
	/* .btn, */
	:global(.primary-btn) {
		/* general */
		@apply bg-blue-600 hover:bg-blue-500 text-white;
		/* general dark */
		@apply bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-yellow-400 dark:hover:from-red-500 dark:hover:via-red-400 dark:hover:to-yellow-400;
	}
	/* .btn, */
	:global(.secondary-btn) {
		/* general */
		@apply bg-gray-50 hover:bg-gray-100;
		/* general dark */
		@apply dark:bg-gray-800 dark:hover:bg-gray-700;
	}

	:global(.input) {
		/* general */
		@apply px-4 py-1 rounded-2xl shadow-inner;
		/* general dark */
		@apply dark:bg-gray-600 dark:border-gray-600 dark:text-gray-100;
	}
</style>
