
export class Teletype {
    constructor(node: any) {
        this.node = node;
        this.text = '';
        this.textIndex = 0;
        this.id = 0;
        this.speed = 40;

        this.updateChar = this._updateChar.bind(this);
    }

    setText(text) {
        this.text = text;
        if (this.id) {
            clearTimeout(this.id);
        }
        this.animate();
    }

    finish() {
        clearTimeout(this.id);
        this.node.textContent = this.text;
    }
    getTegIndex(text, index) {
        let countEnd = 0;
        // console.log(text.length, index)

        while (true) {
            // console.log(countEnd, text[index])
            if (text[index] == ">") {
                countEnd++;

            }
            if (countEnd == 2 || index > text.length - 1) {
                break
            }
            index++;
        }
        index++;
        return index;
    }
    _updateChar() {


        if (this.textIndex <= this.text.length) {

            // this.node.textContent = this.text.substr(0, this.textIndex);
            let span = document.createElement("span");
            if (this.text[this.textIndex] == "&" && this.text[this.textIndex + 1] == "<") {

                this.text = this.text.substr(0, this.textIndex) + this.text.substr(this.textIndex + 1, this.text.length)
                span.innerHTML = this.text.substr(0, this.textIndex - 1);
                this.node.append(span);

                this.textIndex = this.getTegIndex(this.text, this.textIndex);
                // alert(this.textIndex);

                // this.node.innerHTML = this.text.substr(0, this.textIndex);
                // this.node.append(this.text.substr(this.textIndex - 1, this.textIndex));
                // this.node.innerHTML = this.text[this.textIndex - 1];

                span.innerHTML = this.text.substr(0, this.textIndex);
                this.node.innerHTML = "";
                this.node.append(span);
                // setTimeout(() => {
                //     this.node.innerHTML = this.text.substr(0, this.textIndex);
                // }, 250)
            } else {
                this.node.innerHTML = "";
                span.innerHTML = this.text.substr(0, this.textIndex)
                // this.node.innerHTML = this.text.substr(0, this.textIndex);
                // this.node.append(this.text.substr(this.textIndex - 1, this.textIndex));
                // this.node.innerHTML = this.text[this.textIndex - 1];
                this.node.append(span);

            }
            // this.node.innerHTML = this.text.substr(0, this.textIndex);
            // let tmp = document.createElement("p");
            // tmp.innerHTML = this.text.substr(0, this.textIndex)


            this.textIndex++;

            this.node.classList.add('textblock__content');

            if (this.textIndex > 100) {
                this.node.scrollBy(0, 3.3);
            }
        } else {
            clearTimeout(this.id);
        }
        this.id = setTimeout(this.updateChar, this.speed);
    }

    animate() {
        this.node.textContent = '';
        this.textIndex = 0;

        this.updateChar();
    }
}

