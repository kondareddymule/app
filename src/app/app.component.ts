import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  visible: boolean = false;
  text: string = '';
  datasource: any = null;
  editedNode: any = null;
  deletedNode: any = null;
  deleteshow: boolean = false;
  parent: any = null;
  parentLabel: any
  direction: string = 't2b'

  getUniqueId() {
    return new Date().getTime();
  }

  show() {
    this.visible = true;
    this.editedNode = null;
    this.text = '';
  }

  changeDirection() {
  const element = document.getElementById('chart-container');
  if (element) {
    element.innerHTML = '';
  }

  this.direction = this.direction === 't2b' ? 'l2r' : 't2b';
  this.rerender();
}


  ngOnInit() {
    this.datasource = null;
  }

  ngAfterViewInit() {
    this.rerender();
  }

  rerender() {
    if (!this.datasource) return;
    if(this.datasource) {
      this.setRelationships(this.datasource)
    }
    
    ($('#chart-container') as any).orgchart({
      data: this.datasource,
      direction: this.direction,
      createNode: (node: any) => {
      const nativeNode = node[0]
      const nodeData = $(node).data('nodeData')

      const title = nativeNode.querySelector('.title');
      if(title) {
        title.style.cursor = 'pointer'
        title.addEventListener('click', (e: any) => {
        e.stopPropagation()
        this.parent = nodeData.id;
        this.parentLabel = nodeData.name;
        this.visible = true;
      });
      }

      const div = document.createElement('span');
      div.style.marginLeft = '10px';

      const editIcon = document.createElement('i');
      editIcon.className = 'pi pi-pencil';
      editIcon.style.cursor = 'pointer';
      editIcon.style.marginLeft = '10px';
      editIcon.style.fontSize = '12px';
      editIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.editedNode = nodeData.id;
        this.text = nodeData.name;
        this.visible = true;
      });

      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'pi pi-trash';
      deleteIcon.style.cursor = 'pointer';
      deleteIcon.style.marginLeft = '10px';
      deleteIcon.style.fontSize = '12px';
      deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deletedNode = nodeData.id;
        this.deleteshow = true;
      });

      div.appendChild(editIcon);
      div.appendChild(deleteIcon);

      const titleElement = nativeNode.querySelector('.title');
      if (titleElement) {
        titleElement.appendChild(div);
      }
    }
    });
  }

  onSumbit() {
    if (this.text.trim() === '') {
      alert('Please enter a node name');
      return;
    }

    const element = document.getElementById('chart-container');
    if (element) {
      element.innerHTML = '';
    }

    if (this.editedNode) {
      this.updateNode(this.datasource, this.editedNode, this.text);
    } else {
      if (!this.datasource) {
        this.datasource = { id: this.getUniqueId(), name: this.text, 'children': [] };
      } else {
        if (!this.parent) {
          alert('Please select a parent node');
          return;
        }
        this.searchNode(this.datasource, this.parent, this.text);
      }
    }

    this.rerender();
    this.visible = false;
    this.editedNode = null;
    this.parent = null;
    this.text = '';
  }

  updateNode(node: any, id: any, newText: string) {
    if (node.id === id) {
      node.name = newText;
      return true;
    }

    if (node.children) {
      for (let child of node.children) {
        if (this.updateNode(child, id, newText)) {
          return true;
        }
      }
    }
    return false;
  }

  deleteNode() {
    this.deleteshow = false;
    if (!this.deletedNode) return;

    if (this.datasource && this.datasource.id === this.deletedNode) {
      this.datasource = null;
    } else {
      this.removeNode(this.datasource, this.deletedNode);
    }

    const element = document.getElementById('chart-container');
    if (element) {
      element.innerHTML = '';
    }

    this.rerender();
    this.deleteshow = false;
    this.deletedNode = null;
  }

  removeNode(node: any, targetId: any): boolean {
    if (!node.children) return false;

    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].id === targetId) {
        node.children.splice(i, 1);
        if (node.children.length === 0) {
          delete node.children;
        }
        return true;
      } else if (this.removeNode(node.children[i], targetId)) {
        return true;
      }
    }
    return false;
  }

  searchNode(node: any, parentId: any, text: string): boolean {
    if (node.id === parentId) {
      if (!node.children) {
        node.children = [];
      }
      node.children.push({ id: this.getUniqueId(), name: text, 'children': [] });
      return true;
    }

    if (node.children) {
      for (let child of node.children) {
        if (this.searchNode(child, parentId, text)) {
          return true;
        }
      }
    }
    return false;
  }


  setRelationships(node: any, parent: any = null) {
      const hasParent = parent !== null ? '1' : '0';
      let hasSibling = '0';
      if (parent && parent.children && parent.children.length > 1) {
        hasSibling = '1';
      }

      const hasChild = (node.children && node.children.length > 0) ? '1' : '0';

      node.relationship = hasParent + hasSibling + hasChild;

      if (node.children) {
        for (const child of node.children) {
          this.setRelationships(child, node);
        }
      }
  }

}
