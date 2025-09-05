function defineButtons<T extends { label: string; id: string }>(
  buttons: readonly T[],
) {
  return buttons;
}

const buttons = defineButtons([
  { label: "Dig", id: "dig" },
  { label: "Stop Others", id: "stopothers" },
] as const);

export type SelectedActionType = (typeof buttons)[number]["id"] | null;

type ButtonType = (typeof buttons)[number];

export class HUD {
  static buttons: ButtonType[] = [...buttons] as const;

  container: HTMLDivElement;
  selectedAction: SelectedActionType = null;

  constructor() {
    // Create container div
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

    for (const btn of buttons) {
      this.addButton(btn.label, () => {
        this.selectedAction = btn.id;
      });
    }
  }

  addButton(name: string, callback: () => void) {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.style.padding = "5px 10px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "16px";
    btn.onclick = callback;
    this.container.appendChild(btn);
  }
}
