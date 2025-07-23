import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';

    visible: boolean = false
    text: string = ""
    datasource: any


    options: any[] = [{name: "Reddy", code: "Reddy"}];
    labels = ["Reddy"]

    parent: any

    show() {
      this.visible = true
    }

    ngOnInit() {
      this.datasource = {name: "Reddy"};
    }
    ngAfterViewInit(): void {
      this.rerender()
      console.log(this.datasource)
    }

    rerender() {

      ($('#chart-container') as any).orgchart({
        'data': this.datasource,
        nodeTitle: 'name',
        pan: true,
        zoom: true

      });
    }

    onSumbit() {

      if(this.labels.includes(this.text)) {
        alert("Please Enter Unique node name")
        return
      }

      if(this.parent === "" || this.text === "") {
        alert("Please Enter both fields")
        return 
      }
      let element = document.getElementById('chart-container')
      if(element) {
        element.innerHTML = ""
      }
      this.labels.push(this.text)
      this.options = []
      for (let i of this.labels) {
        this.options.push({name: i, code: i})
      }
      this.searchNode(this.datasource, this.parent, this.text)
      console.log(this.datasource)
      this.rerender()
      this.visible = false
      this.parent = null
      this.text = ""
    }

    searchNode(node: any, parent: string, text: string) {
      if (node.name === parent) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push({ name: text, 'relationship': '110'});
        return true;
      }

      if (node.children) {
        for (let child of node.children) {
          if (this.searchNode(child, parent, text)) {
            return true;
          }
        }
      }

      return false;
    }

}
