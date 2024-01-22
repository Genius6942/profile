class Brain {
  constructor(inputSize, outputSize) {
    this.inputSize = inputSize + 1;
    this.outputSize = outputSize;
    this.inputs = Array(this.inputSize + 1)
      .fill()
      .map(() => 0);
    this.connections = Array(inputSize + 1)
      .fill()
      .map(() =>
        Array(outputSize)
          .fill()
          .map(() => Math.random() * 2 - 1)
      );
    this.bias = Math.random() * 2 - 1;
  }

  predict(inputs) {
    inputs = [...inputs, this.bias];
    const output = Array(this.outputSize)
      .fill()
      .map(() => 0);
    this.inputs = inputs;
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.outputSize; j++) {
        try {
          output[j] += inputs[i] * this.connections[i][j];
        } catch (e) {
          console.error(e);
          console.log(i, j, output, inputs, this.connections, this.connections[i]);
          throw new Error("oof");
        }
        // if (!inputs[i]) console.log(i)
      }
    }
    return output.indexOf(Math.max(...output));
  }

  mutate() {
    // got to minus 1 for the bias wtf
    const mutation = new Brain(this.inputSize - 1, this.outputSize);
    mutation.connections = [...this.connections.map((connection) => [...connection])];
    mutation.connections = mutation.connections.map((connection) =>
      connection.map((link) => {
        return Math.random() < Brain.mutationRate
          ? link + Math.random() * Brain.maxMutationAmount * 2 - Brain.maxMutationAmount
          : link;
      })
    );

    return mutation;
  }

  static mutationRate = 0.2;

  static maxMutationAmount = 0.1;

  render(inputNames, outputNames, prediction = null) {
    // if (!prediction) prediction = this.predict();
    const names = [...inputNames, "bias"];
    const gap = 50;
    const nodeRadius = 10;
    const height = gap * Math.max(this.inputSize, this.outputSize);

    const graphMarinTop = 50;
    const graphLeftMargin = 700;

    const layerSpacing = 300;
    const maxConnectionWidth = 4;

    const inputY = (index) =>
      graphMarinTop + height / 2 - (this.inputSize * gap) / 2 + gap * index;
    const outputY = (index) =>
      graphMarinTop + height / 2 - (this.outputSize * gap) / 2 + gap * index;

    // render input nodes
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "20px Arial";

    this.connections.forEach((parent, idx) => {
      parent.forEach((conn, connIdx) => {
        ctx.strokeStyle = conn > 0 ? "red" : "blue";
        ctx.lineWidth = maxConnectionWidth * Math.abs(conn);
        ctx.beginPath();
        ctx.moveTo(graphLeftMargin, inputY(idx));
        ctx.lineTo(graphLeftMargin + layerSpacing, outputY(connIdx));
        ctx.stroke();
      });
    });

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    for (let i = 0; i < this.inputSize; i++) {
      ctx.fillStyle = "#888888";
      ctx.beginPath();
      ctx.arc(graphLeftMargin, inputY(i), nodeRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.fillText(names[i], graphLeftMargin - nodeRadius - 20, inputY(i));
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let i = 0; i < this.outputSize; i++) {
      ctx.fillStyle = "#888888";
      ctx.beginPath();
      ctx.arc(graphLeftMargin + layerSpacing, outputY(i), nodeRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.fillText(
        outputNames[i],
        graphLeftMargin + layerSpacing + nodeRadius + 20,
        outputY(i)
      );
    }
  }
}
