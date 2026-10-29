import { WasmBoy } from "wasmboy";

const url = "https://hbgbdb.playnation.org/api/v1/games";

let game_list = [];

const overview_element = document.querySelector("#overview");
const search_element = document.querySelector("#search-bar");
const selection_element = document.querySelector("#genre-filter");
const canvas_element = document.querySelector("#wasmboy");
const game_title_element = document.querySelector("#game-title");
const game_description_element = document.querySelector("#game-description");

const wasmboy_options = {
  headless: false,
  useGbcWhenOptional: true,
  isAudioEnabled: true,
  frameSkip: 1,
  audioBatchProcessing: true,
  timersBatchProcessing: false,
  audioAccumulateSamples: true,
  graphicsBatchProcessing: false,
  graphicsDisableScanlineRendering: false,
  tileRendering: true,
  tileCaching: true,
  gameboyFPSCap: 60,
  updateGraphicsCallback: false,
  updateAudioCallback: false,
  saveStateCallback: false,
};

const games = await fetch_json_from_url(url);

async function fetch_from_url(url_to_fetch) {
  try {
    const response = await fetch(url_to_fetch);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(error.message);
  }
}

async function fetch_json_from_url(url_to_fetch) {
  console.log(`Fetching '${url_to_fetch}'`);

  let response = await fetch_from_url(url_to_fetch);

  let data = await response.json();

  console.log(data);

  return data;
}

async function get_games() {
  for (var game_title in games) {
    game_list.push(games[game_title]);
  }

  create_game_overview(game_list);
}

async function create_game_overview(filtered_game_list) {
  overview_element.innerHTML = "";

  for (var game in filtered_game_list) {
    console.log(filtered_game_list[game]);
    console.log(`Creating an overview for '${filtered_game_list[game].name}.'`);

    const new_div = document.createElement("div");
    // const new_title_div = document.createElement("div");
    // const new_title_div_text = document.createElement("p");
    const new_button = document.createElement("button");
    const new_button_image = document.createElement("img");
    // const new_button_text = document.createElement("p");

    // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
    // new_title_div_text.textContent = filtered_game_list[game].name
    // new_button_text.textContent = "PLAY";

    new_div.setAttribute("class", "game_card");
    new_button.setAttribute("class", "game_card_button");
    // new_title_div.setAttribute("class", "game_title");

    // new_button.appendChild(new_button_text);
    new_button.id = filtered_game_list[game]["id"];
    new_button_image.src = `https://hbgbdb.playnation.org/static/res/img/${filtered_game_list[game].id}.png`;

    var charElems = document.getElementsByClassName("char");

    // Play the game >B)
    new_button.addEventListener("click", async function () {
      console.log(this.id);

      game_title_element.textContent = games[this.id]["name"];
      game_description_element.textContent = games[this.id]["description"];

      await WasmBoy.loadROM(games[this.id]["rom"]);
      await WasmBoy.play();
      await WasmBoy.resumeAudioContext();
    });

    overview_element.appendChild(new_div);

    // new_title_div.appendChild(new_title_div_text);
    // new_div.appendChild(new_title_div);
    new_button.appendChild(new_button_image);
    new_div.appendChild(new_button);
  }
}

function match_game_value(game, genre_name) {
  if (genre_name == "none") {
    return true;
  } else {
    for (let genre in game.genres) {
      if (game.genres[genre] == genre_name) {
        return true;
      }
    }

    return false;
  }
}

async function filter_with_search(on_input_event) {
  console.log(on_input_event.target.value);

  const search_term = on_input_event.target.value.trim().toLowerCase();

  if (game_list.length > 0) {
    let game_list_filtered = game_list.filter(
      (game) =>
        game.name.toLowerCase().startsWith(search_term) &&
        match_game_value(game, selection_element.value),
    );

    create_game_overview(game_list_filtered);
  }
}

async function filter_with_selector(on_select_event) {
  let game_list_filtered = game_list.filter(
    (game) => match_game_value(game, on_select_event.target.value) == true,
  );

  create_game_overview(game_list_filtered);

  return game_list_filtered;
}


async function initialize() {
  search_element.addEventListener("input", filter_with_search);
  selection_element.addEventListener("change", filter_with_selector);

  WasmBoy.config(wasmboy_options, canvas_element).then(() => {
    console.log("WasmBoy is now configured, yay!");
  });

  get_games();
}

initialize();
