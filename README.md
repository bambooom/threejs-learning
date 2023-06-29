> 一个canvas的内部尺寸，它的分辨率，通常被叫做绘图缓冲区(drawingbuffer)尺寸。 在three.js中我们可以通过调用 `renderer.setSize` 来设置canvas的绘图缓冲区。 我们应该选择什么尺寸? 最显而易见的是"和 canvas 的显示尺寸一样"。 即可以直接用canvas的 `clientWidth` 和 `clientHeight` 属性。

> 基于 BufferGeometry 的图元是面向性能的类型。 几何体的顶点是直接生成为一个高效的类型数组形式，可以被上传到 GPU 进行渲染。 这意味着它们能更快的启动，占用更少的内存。但如果想修改数据，就需要复杂的编程。
> 基于 Geometry 的图元更灵活、更易修改。 它们根据 JavaScript 的类而来，像 Vector3 是 3D 的点，Face3 是三角形。 它们需要更多的内存，在能够被渲染前，Three.js 会将它们转换成相应的 BufferGeometry 表现形式。
> 如果你知道你不会操作图元，或者你擅长使用数学来操作它们，那么最好使用基于 BufferGeometry 的图元。 但如果你想在渲染前修改一些东西，那么 Geometry 的图元会更好操作。
> 举个简单的例子，BufferGeometry 不能轻松的添加新的顶点。 使用顶点的数量在创建时就定好了，相应的创建存储，填充顶点数据。 但用 Geometry 你就能随时添加顶点。

>现在并不明显是否右边有 5000 个三角形的比中间只有 480 个三角形的好更多。 如果你只是绘制少量球体，比如一个地球地图的球体，那么单个 10000 个三角形的球体就是个不错的选择。 但如果你要画 1000 个球体，那么 1000 个球体 x 10000 个三角形就是一千万个三角形。 想要动画流畅，你需要浏览器每秒绘制 60 帧，那么上面的场景就需要每秒绘制 6 亿个三角形。那是巨大的运算量。
> 细分的越少，运行的越流畅，使用的内存也会更少。 你需要根据你的具体情况选择合适的方案。



## Logs

- [x] [Fundamentals](https://threejs.org/manual/#zh%252Ffundamentals): 6.26 ✅
- [x] [Responsive](https://threejs.org/manual/#zh%252Fresponsive): 6.27 ✅
- [x] [Primitives 图元](https://threejs.org/manual/#zh%252Fprimitives): 6.27 ✅
- [x] [Scenegraph 场景图](https://threejs.org/manual/#zh/scenegraph): 6.29 ✅
- [x] [Materials 材质](https://threejs.org/manual/#zh%252Fmaterials): 6.29 ✅
