import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DataService } from '../../../services/data.service';

@Component({
    selector: 'app-log-output',
    standalone: true,
    imports: [CommonModule],
    template: `
    <pre class="json-container" [innerHTML]="highlightJSON(logData)"></pre>
  `
})
export class LogComponent {
    logData: any;

    _dataService = inject(DataService);

    constructor() { }

    ngOnInit() {
        this._dataService.outputBlockSelected$.subscribe((item) => {
            if (item) {
                if (item.inputBlock?.groupType == 'input') {
                    this._dataService.getConnectionData(item.inputBlock.id)?.subscribe((data) => {
                        this.logData = data;
                    });
                } else if (item.inputBlock?.groupType == 'transformation') {
                    this._dataService.getTransformedData(item.inputBlock.id)?.subscribe((data) => {
                        this.logData = data;
                    });
                }
            }
        })
    }

    highlightJSON(json: any): string {
        if (json != null) {
            if (typeof json !== 'string') {
                json = JSON.stringify(json, null, 2); // Format JSON with indentation
            }
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
                (match: any) => {
                    let cls = 'number'; // Default class
                    if (/^"/.test(match)) {
                        cls = /:$/.test(match) ? 'key' : 'string'; // Key or string
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return `<span class="${cls}">${match}</span>`;
                }
            );
        }
        return "";
    }

}