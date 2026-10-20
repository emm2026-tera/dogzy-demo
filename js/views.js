const COIN = () => h("span", { class: "coin" });
const Views = {
  home(D) {
    const C = D.characters.characters, B = D.businesses.businesses;
    const strip = h("div", { class: "strip" }, C.slice(0, 9).map((c) => h("a", { href: "#/character/" + c.id }, h("img", { src: c.image, alt: c.name }))));
    const sect = (ic, kicker, title, text, link, label, imgs) => h("section", { class: "feature f-" + ic },
      h("div", { class: "ftext" }, h("div", { class: "kicker" }, icon(ic, "#e8b848", 20), kicker), h("h2", {}, title), h("p", {}, text),
        h("a", { class: "btn", href: link }, label + " →")),
      h("div", { class: "fimgs" }, imgs));
    return h("div", { class: "home" },
      h("div", { class: "hero-banner" }, h("img", { src: "assets/backgrounds/dogzy-town.jpg", alt: "Welcome to Dogzy Town" })),
      h("section", { class: "hero" },
        h("div", { class: "hero-text" },
          h("div", { class: "kicker" }, "Demo concept amélioré"),
          h("h1", {}, "Play the Dogzy journey.", h("br"), h("span", { class: "gold" }, "Missions • Gear • Avalanche.")),
          h("p", { class: "lead" }, "Dogzy Experience 360 starts with character progression, adds a mission board to unlock accessories, then walks through a simulated Avalanche export flow."),
          h("div", { class: "cta" }, h("a", { class: "btn", href: "#/missions" }, "Start mission board"), h("a", { class: "btn ghost", href: "#/wallet" }, "See Avalanche bridge")),
          h("div", { class: "stats" },
            [[C.length, "job characters"], [B.length, "businesses"], ["5", "mission tiers"], ["1", "token: DOGZY"]].map(([n, l]) => h("div", {}, h("strong", {}, String(n)), h("span", {}, l))))),
        h("div", { class: "hero-art zoom", onclick: () => lightbox(C[0].card, C[0].name) }, h("img", { src: C[0].card, alt: C[0].name }))),
      strip,
      h("section", { class: "concept" },
        h("h2", { class: "center" }, "One universe, four gameplay layers"),
        h("div", { class: "three" },
          [["palette", "Original art", "Every character, shop and scene comes from the artist Valkyrie's own visual universe: a recognizable IP, not stock assets."],
           ["game", "A career game", "Players pick a dog with a job, level it up from apprentice to owner, buy career equipment and run their own business in Dogzy City."],
           ["mission", "Mission board", "Players clear milestone missions to unlock each accessory level before they can buy gear, creating a real progression loop."],
           ["chain", "Blockchain bridge", "In-game tokens stay off-chain while playing. When a player chooses, they export them as DOGZY tokens to their Avalanche wallet through a secured bridge contract."]]
           .map(([i, t, d]) => h("div", { class: "pillar" }, icon(i, "#e8b848", 34), h("h3", {}, t), h("p", {}, d))))),
      sect("chars", "Characters", C.length + " demo characters, " + C.length + " careers", "From the golden retriever chef to the weimaraner pilot, each character has five levels, its own career equipment and its own environment.", "#/characters", "Browse characters",
        C.slice(1, 4).map((c) => h("img", { src: c.image, alt: c.name }))),
      sect("city", "City", B.length + " businesses to build", "Level 5 of every job is a business. The first player to complete it owns it; the next players can buy a franchise.", "#/city", "Explore the city",
        B.slice(11, 14).map((b) => h("img", { src: b.image, alt: b.name }))),
      sect("mission", "Missions", "Web3 Avalanche mission board", "Complete one mission per level to unlock accessory purchases. Each mission logs a simulated proof hash before your gear can be bought.", "#/missions", "Open mission board",
        [h("div", { class: "flow" }, ["Accept mission", "Validate objective", "Unlock accessories"].map((t, i) => h("div", { class: "step" }, h("b", {}, String(i + 1)), t)))]),
      sect("ward", "Inventory", "Career equipment, level by level", "Every character has its own equipment from its career card: 5 items per level, 25 in all. Each level has 4 items plus a GOLD item; owning all 5 completes the level and opens the next one. Prices come from a configurable table.", "#/wardrobe", "Open the inventory",
        [h("img", { class: "panelprev", src: (D.equipment.equipment[C[0].id] || [{}])[0].panel, alt: "Chef level-1 equipment" })]),
      sect("wallet", "Wallet", "Export to Avalanche", "A walkthrough of the real bridge flow: game debit, signed voucher, on-chain claim. In this demo nothing leaves your browser.", "#/wallet", "Open the wallet",
        [h("div", { class: "flow" }, ["Game tokens", "Signed voucher", "DOGZY on Avalanche"].map((t, i) => h("div", { class: "step" }, h("b", {}, String(i + 1)), t)))]));
  },

  characters(D) {
    const st = State.data;
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Characters"),
        h("p", { class: "muted" }, "Every dog has a job and five career levels. Tap a character to see its career, dress it up or play it.")),
      h("div", { class: "grid chars" }, D.characters.characters.map((c) => {
        const go = () => { location.hash = "#/character/" + c.id; };
        const owned = isOwned(c);
        return h("div", { class: "card tap" + (st.character === c.id ? " selected" : ""), "data-char": c.id, role: "button", tabindex: "0", onclick: go, onkeydown: (e) => { if (e.key === "Enter") go(); } },
          h("div", { class: "pic" }, h("img", { src: c.image, alt: c.name, loading: "lazy" }), st.character === c.id ? h("span", { class: "badge" }, "Active") : owned ? h("span", { class: "badge" }, "Owned") : null),
          h("div", { class: "body" },
            h("strong", {}, c.job),
            h("div", { class: "tags" }, h("span", { class: "tag" }, c.breed), c.level5 && h("span", { class: "tag gold" }, "Lv 5 · " + c.level5)),
            h("span", { class: "btn small" }, "View character →")));
      })));
  },

  character(D, id) {
    const st = State.data, C = D.characters.characters, c = C.find((x) => x.id === id);
    if (!c) return h("div", { class: "pagehead" }, h("h1", {}, "Character not found"), h("a", { class: "btn", href: "#/characters" }, "Back to characters"));
    const biz = D.businesses.businesses.find((b) => b.id === c.business);
    const owned = isOwned(c), active = st.character === c.id;
    const EQ = (D.equipment.equipment || {})[c.id] || [];
    const levels = EQ.length === 5 ? EQ.map((L) => L.title + " — " + L.items.map((x) => x.name).join(", ")) : ["Level-1 " + c.job, "Confirmed " + c.job, "Senior " + c.job, c.level4 || "Manager", c.level5 || "Business owner"];
    const select = () => owned ? activate(c) : buyDialog(c, biz);
    return h("div", { class: "detail" },
      h("a", { class: "back small", href: "#/characters" }, "← All characters"),
      h("div", { class: "detail-grid" },
        h("div", { class: "portrait card" }, h("img", { src: c.image, alt: c.name }), active && h("span", { class: "badge" }, "Active")),
        h("div", { class: "card padded" },
          h("div", { class: "kicker" }, c.breed),
          h("h1", {}, c.name),
          h("p", { class: "muted" }, c.description),
          h("ol", { class: "levels" }, levels.map((l, i) => h("li", {}, h("b", {}, "Lv " + (i + 1)), h("span", {}, l)))),
          h("div", { class: "price" }, owned ? h("span", { class: "gold" }, active ? "Active character ✓" : "Owned ✓") : h("span", {}, "Unlock: " + c.price + " ", COIN())),
          h("div", { class: "actions" },
            h("button", { class: active ? "ghost" : "", "data-act": "select", onclick: select }, active ? "Selected ✓" : owned ? "Play this character" : "Select this character"),
            h("button", { class: "ghost", "data-act": "wardrobe", onclick: () => { if (!owned) return buyDialog(c, biz, "wardrobe"); activate(c, true); location.hash = "#/wardrobe"; } }, "Open in Inventory"),
            biz && h("a", { class: "bizlink", "data-act": "city", href: "#/city/" + biz.id }, h("span", { class: "bizimg" }, h("img", { src: biz.image, alt: biz.name, loading: "eager" }), h("span", { class: "bizlabel" }, biz.name)), h("span", {}, h("small", { class: "kicker" }, "Their building"), h("b", {}, biz.name + " →"))),
            h("button", { class: "ghost", onclick: () => lightbox(c.card, c.name) }, "View full career card")))));
  },

  businesses(D) {
    const st = State.data, price = PRICES.business();
    const list = D.characters.characters.map((c) => ({ c, b: D.businesses.businesses.find((x) => x.id === c.business) })).filter((x) => x.b);
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Businesses"),
        h("p", { class: "muted" }, "Buy the building that goes with each demo character. Each business is a separate collectible (NFT-style) in your inventory. Price: " + price + " DOGZY each (configurable).")),
      h("div", { class: "grid bizgrid" }, list.map(({ c, b }) => {
        const owned = !!st.biz[b.id];
        return h("div", { class: "card bizcard" + (owned ? " owned" : ""), "data-biz": b.id },
          h("div", { class: "bizimg" }, h("img", { src: b.image, alt: b.name, loading: "lazy" }), h("span", { class: "bizlabel" }, b.name)),
          h("div", { class: "body" },
            h("div", { class: "kicker small" }, b.category),
            h("strong", {}, b.name),
            h("span", { class: "muted small" }, "Paired with " + c.name),
            owned ? h("span", { class: "nftbadge" }, "OWNED · NFT") :
            h("button", { "data-act": "buy-biz", disabled: st.balance < price, onclick: () => {
              if (st.balance < price) return toast("Not enough DOGZY");
              st.balance -= price; st.biz[b.id] = 1; State.save(); toast(b.name + " bought"); App.render(); } }, "Buy · " + price, COIN())));
      })));
  },

  city(D) {
    const st = State.data;
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Dogzy City"),
        h("p", { class: "muted" }, D.businesses.note)),
      h("div", { class: "grid city" }, D.businesses.businesses.map((b) => {
        const owned = b.items.filter((it) => st.inventory[it.id]).length;
        return h("div", { class: "card", id: "biz-" + b.id }, pic(b),
          h("div", { class: "body" },
            h("div", { class: "kicker small" }, b.category),
            h("strong", {}, b.name),
            h("span", { class: "muted small" }, b.description),
            h("div", { class: "progress" }, h("i", { style: "width:" + owned * 20 + "%" })),
            h("div", { class: "small muted" }, "Upgrades " + owned + "/5 · unlocks " + b.unlocks),
            b.items.map((it) => h("div", { class: "item" },
              h("span", {}, it.name),
              st.inventory[it.id] ? h("span", { class: "gold small" }, "Built ✓") :
              h("button", { class: "mini", disabled: st.balance < it.price, onclick: () => {
                st.balance -= it.price; st.inventory[it.id] = 1; State.save(); toast(it.name + " built"); App.render();
              } }, String(it.price), COIN())))));
      })));
  },

  missions(D) {
    const st = State.data, chars = D.characters.characters, ch = chars.find((c) => c.id === st.character);
    const head = h("div", { class: "pagehead" }, h("h1", {}, "Avalanche Mission Board"),
      h("p", { class: "muted" }, "Choisis ton personnage métier, avance avec la roulette, puis réussis des défis pour activer les 5 accessoires de ton niveau."));
    if (!ch || !isOwned(ch)) {
      const owned = chars.filter(isOwned);
      return h("div", {}, head, h("div", { class: "card padded center locked-prompt" },
        h("h2", {}, "Select an owned character"),
        h("p", { class: "muted" }, "You need an unlocked character to start missions and open gear purchases."),
        h("div", { class: "actions" }, h("a", { class: "btn", href: "#/characters" }, "Go to characters"), h("a", { class: "btn ghost", href: "#/wardrobe" }, "Open gear")),
        owned.length ? h("div", { class: "small muted", style: "margin-top:1rem" }, "Your characters: ", owned.map((c) => h("a", { href: "#/missions", style: "margin:0 .3rem", onclick: () => { st.character = c.id; State.save(); App.render(); } }, c.job))) : null));
    }
    const levels = (D.equipment.equipment[ch.id] || []);
    const currentLevel = Math.min(st.level[ch.id] || 1, 5);
    const L = levels[currentLevel - 1];
    if (!L) return h("div", {}, head, h("p", { class: "muted" }, "No mission data for this character."));
    if (!st.activations[ch.id]) st.activations[ch.id] = {};
    if (!st.activations[ch.id][currentLevel]) st.activations[ch.id][currentLevel] = {};
    if (!st.missionPos[ch.id]) st.missionPos[ch.id] = 0;
    const board = [
      { kind: "hidden", label: "Objets cachés", detail: "Trouve un indice secret dans une zone de mission." },
      { kind: "quiz", label: "Quiz QI", detail: "Réponds à une question métier pour valider ta logique." },
      { kind: "game", label: "Mini-jeu", detail: "Réussis un mini-jeu de réflexe pour progresser." },
      { kind: "search", label: "Fouille commerce", detail: "Permission accordée pour fouiller un commerce et récupérer une activation." },
      { kind: "hidden", label: "Objets cachés", detail: "Récupère un objet caché dans Dogzy City." },
      { kind: "quiz", label: "Quiz QI", detail: "Défi de stratégie avec limite de temps." },
      { kind: "game", label: "Mini-jeu", detail: "Mode arcade: termine l'objectif du tour." },
      { kind: "search", label: "Fouille commerce", detail: "Inspection de boutique partenaire autorisée." },
    ];
    const activated = st.activations[ch.id][currentLevel];
    const activatedCount = L.items.filter((it) => activated[it.id]).length;
    const nextItem = L.items.find((it) => !activated[it.id]);
    const pos = st.missionPos[ch.id] % board.length;
    const tile = board[pos];
    const spin = () => {
      const steps = Math.floor(Math.random() * 6) + 1;
      st.missionPos[ch.id] = (pos + steps) % board.length;
      st.missions[ch.id] = { at: new Date().toISOString(), level: currentLevel, steps, tile: board[st.missionPos[ch.id]].kind };
      State.save();
      App.render();
    };
    const resolve = () => {
      if (!nextItem) return toast("Niveau " + currentLevel + " déjà activé à 100%");
      activated[nextItem.id] = 1;
      const reward = 6 + currentLevel;
      st.balance += reward;
      st.missions[ch.id] = { at: new Date().toISOString(), level: currentLevel, tile: tile.kind, unlocked: nextItem.id, proof: randomHex(10) };
      State.save();
      toast(nextItem.name + " activé · +" + reward + " DOGZY");
      App.render();
    };
    return h("div", {}, head,
      h("div", { class: "card padded mission-summary" },
        h("div", { class: "kicker" }, icon("chain", "#e8b848", 18), "Avalanche-ready progression"),
        h("div", { class: "item big" }, h("span", {}, "Niveau actif"), h("strong", {}, "Level " + currentLevel + " · " + L.title)),
        h("div", { class: "item big" }, h("span", {}, "Activations accessoires"), h("strong", {}, activatedCount + " / " + L.items.length)),
        h("p", { class: "small muted" }, "Chaque activation débloque l'achat d'un accessoire spécifique du niveau en cours.")),
      h("div", { class: "grid missions" },
        h("div", { class: "card padded mission-board" },
          h("h3", {}, "Roulette de progression"),
          h("div", { class: "small muted" }, "Position actuelle: case " + (pos + 1) + "/" + board.length),
          h("div", { class: "roulette-track" }, board.map((cell, i) => h("span", { class: "roulette-cell" + (i === pos ? " active" : "") }, cell.label))),
          h("button", { onclick: spin }, "Lancer la roulette (1-6)"),
          h("p", { class: "small muted" }, "Après le lancer, la case détermine le type de défi.")),
        h("div", { class: "card padded mission-card" + (nextItem ? "" : " done") },
          h("div", { class: "lvhead" }, h("b", {}, "Case tirée"), h("span", {}, tile.label), h("em", { class: "status" }, nextItem ? "Activation en attente" : "Niveau activé ✓")),
          h("p", { class: "small muted" }, tile.detail),
          h("div", { class: "item" }, h("span", {}, "Prochain accessoire"), h("strong", {}, nextItem ? nextItem.name : "Tous activés")),
          h("div", { class: "item" }, h("span", {}, "Type d'action"), h("strong", {}, tile.kind === "hidden" ? "Mission objets cachés" : tile.kind === "quiz" ? "Quiz QI" : tile.kind === "game" ? "Mini-jeu" : "Permission fouille commerce")),
          h("div", { class: "actions" },
            h("button", { disabled: !nextItem, onclick: resolve }, nextItem ? "Valider le défi et activer l'accessoire" : "Niveau déjà activé"),
            h("a", { class: "btn ghost", href: "#/wardrobe" }, "Aller au Gear"))),
        h("div", { class: "card padded mission-card" },
          h("h3", {}, "Accessoires du level " + currentLevel),
          h("div", { class: "items" }, L.items.map((it) => h("div", { class: "item" },
            h("span", {}, it.name),
            activated[it.id] ? h("span", { class: "gold small" }, "Activation prête ✓") : h("span", { class: "muted small" }, "À activer via roulette")))))));
  },

  wardrobe(D) {
    const st = State.data, chars = D.characters.characters;
    const ch = chars.find((c) => c.id === st.character);
    const head = h("div", { class: "pagehead" }, h("h1", {}, "Inventory"), h("p", { class: "muted" }, "Each character's own career equipment, from its career card. Own all 5 items of a level (4 + GOLD) to complete it, then pay the next level's fee."));
    if (!ch || !isOwned(ch)) {
      const owned = chars.filter(isOwned);
      return h("div", {}, head, h("div", { class: "card padded center locked-prompt", "data-test": "unlock-first" },
        h("h2", {}, ch ? "Unlock " + ch.job + " first" : "Unlock a character first"),
        h("p", { class: "muted" }, ch ? "This character is not yours yet. Unlock it for " + ch.price + " DOGZY to use its inventory." : "Pick a character and unlock it with DOGZY to open its inventory."),
        h("div", { class: "actions" },
          ch ? h("button", { onclick: () => buyDialog(ch, D.businesses.businesses.find((b) => b.id === ch.business)) }, "Unlock " + ch.job + " · " + ch.price + " DOGZY") : null,
          h("a", { class: "btn ghost", href: "#/characters" }, "Browse characters")),
        owned.length ? h("div", { class: "small muted", style: "margin-top:1rem" }, "Your characters: ", owned.map((c) => h("a", { href: "#/wardrobe", style: "margin:0 .3rem", onclick: () => { st.character = c.id; State.save(); App.render(); } }, c.job))) : null));
    }
    const E = (D.equipment.equipment || {})[ch.id] || [];
    const unlocked = Math.min(st.level[ch.id] || 1, 5);
    const complete = (L) => L.items.every((x) => st.gear[x.id]);
    if (!st.activations[ch.id]) st.activations[ch.id] = {};
    const activeMap = (level) => {
      if (!st.activations[ch.id][level]) st.activations[ch.id][level] = {};
      return st.activations[ch.id][level];
    };
    const doneCount = E.filter(complete).length;
    const lvl = doneCount >= 5 ? 6 : unlocked; // 6 = career complete
    const all = E.flatMap((L) => L.items.map((it) => Object.assign({ lv: L.level }, it)));
    const mine = all.filter((it) => st.gear[it.id]);
    const buy = (it, L) => modal(h("div", { class: "kicker" }, "Demo purchase · in-game DOGZY, no real money"),
      h("h2", {}, it.gold ? "GOLD item: " + it.name : it.name),
      h("div", { class: "sum" }, h("div", {}, h("span", {}, "Price"), h("b", { "data-test": "item-price" }, String(it.price), COIN())), h("div", {}, h("span", {}, "Your balance"), h("b", {}, String(st.balance), COIN())), h("div", {}, h("span", {}, "After purchase"), h("b", {}, String(st.balance - it.price), COIN()))),
      h("div", { class: "actions" }, h("button", { "data-act": "confirm-item", disabled: st.balance < it.price, onclick: () => { closeModal(); doBuy(it, L); } }, "Confirm"), h("button", { class: "ghost", "data-act": "cancel", onclick: closeModal }, "Cancel")));
    const doBuy = (it, L) => {
      if (st.balance < it.price) { toast("Not enough DOGZY"); return; }
      st.balance -= it.price; st.gear[it.id] = 1;
      toast(it.gold ? "GOLD " + it.name + " bought · level " + L.level + " complete" + (L.level < 5 ? "! Unlock level " + (L.level + 1) + " next." : " · career complete!") : it.name + " bought");
      State.save(); App.render();
    };
    const levelUp = (L) => { const fee = PRICES.fee(L.level); modal(h("div", { class: "kicker" }, "Level-up fee · in-game DOGZY"), h("h2", {}, "Unlock level " + L.level + ": " + L.title),
      h("div", { class: "sum" }, h("div", {}, h("span", {}, "Fee"), h("b", { "data-test": "fee-price" }, String(fee), COIN())), h("div", {}, h("span", {}, "Your balance"), h("b", {}, String(st.balance), COIN()))),
      h("div", { class: "actions" }, h("button", { "data-act": "confirm-fee", disabled: st.balance < fee, onclick: () => { closeModal(); doLevelUp(L); } }, "Confirm"), h("button", { class: "ghost", "data-act": "cancel", onclick: closeModal }, "Cancel"))); };
    const doLevelUp = (L) => {
      const fee = PRICES.fee(L.level);
      if (st.balance < fee) { toast("Not enough DOGZY"); return; }
      st.balance -= fee; st.level[ch.id] = L.level; State.save(); toast(ch.job + " reached level " + L.level + "!"); App.render();
    };
    const stage = h("div", { class: "stage" }, h("div", { class: "avatar" }, h("img", { class: "base", src: ch.image, alt: ch.job })), h("div", { class: "platform" }));
    return h("div", {}, head,
      h("div", { class: "row wardrobe" },
        h("div", {},
          h("div", { class: "card padded center" }, stage,
            h("h3", {}, ch.name),
            h("div", { class: "lvlbar" }, [1, 2, 3, 4, 5].map((n) => h("i", { class: n < lvl ? "done" : n === lvl ? "cur" : "" }))),
            h("p", { class: "small", "data-test": "level" }, lvl > 5 ? "Career complete · all 5 levels" : "Level " + lvl + " · " + (E[lvl - 1] ? E[lvl - 1].title : "")),
            h("p", { class: "small muted" }, h("a", { href: "#/characters" }, "Change character"))),
          h("div", { class: "card padded inventory", "data-test": "inventory" },
            h("div", { class: "kicker small" }, "Inventory Book · " + ch.job + " · " + mine.length + "/" + all.length),
            h("p", { class: "small muted" }, "Mission board requis pour activer les accessoires · ", h("a", { href: "#/missions" }, "Open mission board")),
            mine.length ? E.map((L) => { const got = L.items.filter((x) => st.gear[x.id]); return got.length ? h("div", { class: "book-lv" }, h("div", { class: "small gold" }, "Level " + L.level + " · " + L.title), h("div", { class: "chips" }, got.map((it) => h("span", { class: "chip" + (it.gold ? " gold" : "") }, it.gold ? "GOLD · " : "", it.name)))) : null; })
              : h("p", { class: "small muted" }, "Your Inventory Book is empty. Buy your first level-1 item."))),
        h("div", {}, E.map((L) => {
          const isDone = complete(L), isOpen = L.level <= unlocked;
          const levelActive = activeMap(L.level);
          const activationCount = L.items.filter((it) => levelActive[it.id]).length;
          const state = isDone ? "done" : isOpen ? "cur" : "locked";
          const prevDone = L.level === 1 || complete(E[L.level - 2]);
          const fee = PRICES.fee(L.level);
          return h("div", { class: "card padded level " + state, "data-level": L.level },
            h("div", { class: "lvhead" }, h("b", {}, "Level " + L.level), h("span", {}, L.title),
              h("em", { class: "status" }, isDone ? "Completed ✓" : isOpen ? ("Activations " + activationCount + "/5") : prevDone ? "Ready to unlock" : "Locked · complete level " + (L.level - 1))),
            !isOpen ? h("div", { class: "levelup" },
              h("span", { class: "small" }, "Level " + L.level + " fee: " + fee + " ", COIN()),
              h("button", { class: "mini", "data-act": "levelup-" + L.level, disabled: !prevDone || st.balance < fee, onclick: () => levelUp(L) }, "Unlock level " + L.level + " · " + fee, COIN())) : null,
            isOpen && activationCount < 5 ? h("div", { class: "levelup mission-lock" },
              h("span", { class: "small" }, "Accessoires activés: " + activationCount + "/5 via mission board."),
              h("a", { class: "btn mini", href: "#/missions" }, "Open missions")) : null,
            h("img", { class: "panel", src: L.panel, alt: "Level " + L.level + " equipment from the career card", loading: "lazy" }),
            h("div", { class: "items" }, L.items.map((it) => {
              const has = !!st.gear[it.id], regsDone = L.items.filter((x) => !x.gold).every((x) => st.gear[x.id]);
              const isActivated = !!levelActive[it.id];
              const can = isOpen && isActivated && !has && st.balance >= it.price && (!it.gold || regsDone);
              return h("div", { class: "item" + (it.gold ? " gold" : "") + (has ? " has" : ""), "data-item": it.id },
                h("span", {}, it.gold ? h("span", { class: "goldtag", "data-test": "gold-label" }, "GOLD") : null, it.name, !isActivated && !has ? h("small", { class: "muted" }, " · requires mission activation") : null, it.gold ? h("small", { class: "muted" }, " · completes the level" + (regsDone || has ? "" : " (buy the 4 others first)")) : null),
                has ? h("span", { class: "gold small" }, "Owned ✓") :
                h("button", { class: "mini" + (it.gold ? " goldbtn" : ""), disabled: !can, onclick: () => buy(it, L) }, String(it.price), COIN()));
            })));
        }))));
  },

  wallet(D) {
    const st = State.data;
    const items = D.businesses.businesses.flatMap((b) => b.items.map((i) => Object.assign({ biz: b.name }, i)));
    const owned = Object.keys(st.inventory);
    const log = h("div", { class: "log" }, "Ready. Enter an address and an amount.");
    const addr = h("input", { placeholder: "0x… your Avalanche C-Chain address", value: "0x8f3C9a1B2d4E5f60718293a4B5c6D7e8F9012345" });
    const amt = h("input", { type: "number", min: "1", step: "1", value: "50" });
    const quote = h("p", { class: "muted small" });
    const btn = h("button", {}, "Run export walkthrough");
    const upd = () => { quote.textContent = "You receive " + BridgeSim.quote(parseInt(amt.value, 10) || 0) + " DOGZY · rate 1:" + (BridgeSim.rate / BridgeSim.RATE_DENOMINATOR) + " · max " + BridgeSim.maxClaim + " per claim"; };
    amt.addEventListener("input", upd); upd();
    btn.addEventListener("click", async () => {
      const amount = Number(amt.value);
      const err = BridgeSim.validate(addr.value.trim(), amount, st.balance);
      if (err) { log.textContent = ""; log.append(h("span", { class: "err" }, err)); return; }
      btn.disabled = true; log.textContent = "";
      await BridgeSim.run(addr.value.trim(), amount, st, (line, cls) => log.append(h("div", { class: cls }, line)));
      btn.disabled = false; State.save(); const ib = document.getElementById("invbal"); if (ib) ib.textContent = st.balance;
    });
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Wallet"), h("p", { class: "muted" }, "Tokens are earned in the game, then exported to Avalanche when the player decides.")),
      h("div", { class: "flow wide" }, ["Earn tokens in game", "Game server signs a voucher", "Player claims DOGZY on Avalanche"].map((t, i) => h("div", { class: "step" }, h("b", {}, String(i + 1)), t))),
      h("div", { class: "row" },
        h("div", { class: "card padded" }, h("h2", {}, "Game inventory"),
          h("div", { class: "item big" }, h("span", {}, COIN(), " DOGZY game tokens"), h("strong", { id: "invbal" }, String(st.balance))),
          owned.length ? owned.map((id) => { const it = items.find((i) => i.id === id) || { name: id, biz: "" };
            return h("div", { class: "item" }, h("span", {}, it.name), h("span", { class: "muted small" }, it.biz)); })
            : h("p", { class: "muted" }, "No upgrades built yet. Visit the City."),
          h("button", { class: "ghost", onclick: () => { State.reset(); App.render(); } }, "Reset demo")),
        h("div", { class: "card padded" }, h("h2", {}, "Export to Avalanche"),
          h("label", {}, "Avalanche wallet address"), addr,
          h("label", {}, "In-game tokens to export"), amt, quote, btn, log)),
      st.exports.length ? h("div", { class: "card padded", style: "margin-top:1rem" }, h("h2", {}, "Export history"),
        st.exports.map((e) => h("div", { class: "item" }, h("span", {}, e.amount + " tokens → " + e.out + " DOGZY"), h("span", { class: "muted small" }, e.address.slice(0, 10) + "…")))) : null);
  },
};

function isOwned(c) { return !!(c && State.data.owned[c.id]); }
function activate(c, quiet) { State.data.character = c.id; State.save(); if (!quiet) { toast(c.job + " is now your character"); App.render(); } }
function closeModal() { const m = document.getElementById("modal"); if (m) m.remove(); }
function modal(...kids) {
  closeModal();
  const m = h("div", { id: "modal", class: "modal", onclick: (e) => { if (e.target === m) closeModal(); } }, h("div", { class: "sheet", role: "dialog", "aria-modal": "true" }, kids));
  document.body.append(m); return m;
}
function buyDialog(c, biz, after) {
  const st = State.data, enough = st.balance >= c.price;
  modal(h("div", { class: "kicker" }, "Demo purchase · in-game DOGZY tokens, no real money"),
    h("h2", {}, "Unlock " + c.name + "?"),
    h("div", { class: "sum" },
      h("div", {}, h("span", {}, "Price"), h("b", {}, String(c.price), COIN())),
      h("div", {}, h("span", {}, "Your balance"), h("b", {}, String(st.balance), COIN())),
      h("div", {}, h("span", {}, "After purchase"), h("b", { class: enough ? "" : "bad" }, String(st.balance - c.price), COIN()))),
    enough ? null : h("p", { class: "bad small" }, "Not enough DOGZY. You need " + (c.price - st.balance) + " more. Earn tokens by playing, or reset the demo balance in the Wallet."),
    h("div", { class: "actions" },
      h("button", { "data-act": "confirm", disabled: !enough, onclick: () => {
        st.balance -= c.price; st.owned[c.id] = 1; st.character = c.id; State.save(); App.render();
        modal(h("div", { class: "kicker" }, "Success"), h("h2", {}, c.job + " unlocked ✓"),
          h("p", { class: "muted" }, c.price + " DOGZY spent. New balance: " + st.balance + " DOGZY. " + c.name + " is now your active character."),
          h("div", { class: "actions" },
            h("button", { "data-act": "go-wardrobe", onclick: () => { closeModal(); location.hash = "#/wardrobe"; } }, "Open in Inventory"),
            biz && h("button", { class: "ghost", "data-act": "go-city", onclick: () => { closeModal(); location.hash = "#/city/" + biz.id; } }, "Go to " + biz.name),
            h("button", { class: "ghost", onclick: closeModal }, "Close")));
      } }, "Confirm"),
      enough ? null : h("a", { class: "btn ghost", href: "#/wallet", onclick: closeModal }, "Open Wallet"),
      h("button", { class: "ghost", "data-act": "cancel", onclick: closeModal }, "Cancel")));
}
