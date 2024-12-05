// Helper function to draw a line between two div elements
export function connect(
    div1: HTMLElement,
    div2: HTMLElement,
    color: string = "#000",
    thickness: number = 2,
    lineId: string = "line"
): void {
    const existingLine = document.getElementById(lineId);
    if (existingLine) existingLine.remove(); // Remove old line

    const off1 = getOffset(div1);
    const x1 = off1.left + off1.width;
    const y1 = off1.top + off1.height / 2;

    const off2 = getOffset(div2);
    const x2 = off2.left;
    const y2 = off2.top + off2.height / 2;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const cx = (x1 + x2) / 2 - length / 2;
    const cy = (y1 + y2) / 2 - thickness / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    const htmlLine = `
    <div id="${lineId}" style="
      padding:0px; margin:0px; height:${thickness}px; z-index:99;
      background-color:${color}; line-height:1px; position:absolute;
      left:${cx}px; top:${cy}px; width:${length}px;
      transform:rotate(${angle}deg);">
    </div>`;

    //TODO:  Add support for different colors of the lines based on the status of the connection between the elements
    document.body.insertAdjacentHTML("beforeend", htmlLine);
}

// Helper function to get the offset of an element
function getOffset(el: HTMLElement): { left: number; top: number; width: number; height: number } {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width,
        height: rect.height,
    };
}