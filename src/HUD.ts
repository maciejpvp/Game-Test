function defineButtons<T extends { label: string; id: string }>(
  buttons: readonly T[],
) {
  return buttons;
}

const buttons = defineButtons([
  { label: "Dig", id: "dig" },
  { label: "Stop Others", id: "stopothers" },
  { label: "Parachute", id: "parachute" },
] as const);

export type SelectedActionType = (typeof buttons)[number]["id"] | null;

type ButtonType = (typeof buttons)[number];

export class HUD {
  static buttons: ButtonType[] = [...buttons] as const;
  overlay: HTMLDivElement | null = null;

  container: HTMLDivElement;
  selectedAction: SelectedActionType = null;
  buttonElements: Map<string, HTMLButtonElement> = new Map();

  constructor() {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.bottom = "10px";
    this.container.style.left = "10px";
    this.container.style.padding = "8px";
    this.container.style.backgroundColor = "rgba(0,0,0,0.5)";
    this.container.style.borderRadius = "8px";
    this.container.style.zIndex = "1000";
    this.container.style.display = "flex";
    this.container.style.gap = "5px";
    document.body.appendChild(this.container);

    for (const btn of HUD.buttons) {
      this.addButton(btn.label, btn.id);
    }
  }

  private addButton(label: string, id: SelectedActionType) {
    if (!id) return;
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.padding = "5px 10px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "16px";
    btn.style.border = "2px solid #444";
    btn.style.borderRadius = "6px";
    btn.style.background = "#eee";

    btn.onclick = () => {
      this.selectedAction = id;
      this.updateButtonStates();
    };

    this.container.appendChild(btn);
    this.buttonElements.set(id, btn);
  }

  private updateButtonStates() {
    for (const [id, btn] of this.buttonElements.entries()) {
      if (id === this.selectedAction) {
        btn.style.background = "#aaa"; // pressed look
        btn.style.transform = "translateY(2px)";
        btn.style.boxShadow = "inset 2px 2px 4px rgba(0,0,0,0.5)";
      } else {
        btn.style.background = "#eee"; // normal look
        btn.style.transform = "none";
        btn.style.boxShadow = "none";
      }
    }
  }

  showNextLevelOverlay(nextLevel: () => void) {
    this.overlay = document.createElement("div");
    this.overlay.style.position = "absolute";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100%";
    this.overlay.style.height = "100%";
    this.overlay.style.display = "flex";
    this.overlay.style.flexDirection = "column";
    this.overlay.style.alignItems = "center";
    this.overlay.style.justifyContent = "center";
    this.overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    this.overlay.style.zIndex = "2000";
    this.overlay.style.fontFamily = "sans-serif";
    this.overlay.style.color = "white";
    this.overlay.style.fontSize = "32px";

    const title = document.createElement("div");
    title.textContent = "Level Complete!";
    title.style.marginBottom = "20px";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next Level";
    nextBtn.style.padding = "10px 20px";
    nextBtn.style.fontSize = "20px";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.border = "2px solid #fff";
    nextBtn.style.borderRadius = "8px";
    nextBtn.style.background = "#4CAF50";
    nextBtn.style.color = "#fff";
    nextBtn.style.boxShadow = "2px 2px 8px rgba(0,0,0,0.6)";

    nextBtn.onclick = () => {
      nextLevel();
      this.hideOverlay();
    };

    this.overlay.appendChild(title);
    this.overlay.appendChild(nextBtn);
    document.body.appendChild(this.overlay);
  }

  private hideOverlay() {
    if (this.overlay) {
      this.overlay.style.display = "none";
    }
  }
}
