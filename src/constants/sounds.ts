export const soundSource = {
    itemPut: "item_put.mp3",
    knifeSlice: "Knife2.m4a",
    sawCutter: "saw_cutter.mp3",
    slamDoor: "slam_door.mp3",
    step: "step.mp3",
    tryDoor: "try_door.mp3",
    switch: "Switch.m4a",
    maniacLaugh: "Laugh1.m4a",
    hurt: "Hurt1.m4a",
    cry: "Cry1.m4a",
    movingItem: "MovingItem.m4a"
}

export const soundFiles = Object.entries(soundSource).map(item => item[1]);
