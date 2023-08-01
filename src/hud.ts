import {
  AdvancedDynamicTexture,
  Button,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import { setTerrainPick } from "./terrain";
let ui: AdvancedDynamicTexture;

export const updateHud = ({ hp }: { hp: string }) => {
  const tblock = ui.getControlByName("hp") as TextBlock;
  tblock.text = hp || "-";
};

export const setupHud = async () => {
  //--GUI--
  ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const panel = new StackPanel();
  panel.isVertical = false;
  panel.height = "20px";
  panel.width = "100%";
  panel.top = "5px";
  panel.verticalAlignment = 0;
  ui.addControl(panel);

  //Game timer text
  const clockTime = new TextBlock();
  clockTime.name = "hp";
  clockTime.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
  clockTime.fontSize = "16px";
  clockTime.color = "white";
  clockTime.text = "-";
  clockTime.resizeToFit = true;
  clockTime.height = "20px";
  clockTime.width = "220px";
  clockTime.fontFamily = "Viga";
  panel.addControl(clockTime);
  const addTower = Button.CreateSimpleButton('addTower', 'Add Tower');
  addTower.fontSize = "16px";
  addTower.color = "white";
  addTower.height = "20px";
  addTower.width = "120px";
  addTower.onPointerUpObservable.add(()=>{
    setTerrainPick(true);
  });
  panel.addControl(addTower);
};
