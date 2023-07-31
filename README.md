> 一个canvas的内部尺寸，它的分辨率，通常被叫做绘图缓冲区(drawingbuffer)尺寸。 在three.js中我们可以通过调用 `renderer.setSize` 来设置canvas的绘图缓冲区。 我们应该选择什么尺寸? 最显而易见的是"和 canvas 的显示尺寸一样"。 即可以直接用canvas的 `clientWidth` 和 `clientHeight` 属性。

> 基于 BufferGeometry 的图元是面向性能的类型。 几何体的顶点是直接生成为一个高效的类型数组形式，可以被上传到 GPU 进行渲染。 这意味着它们能更快的启动，占用更少的内存。但如果想修改数据，就需要复杂的编程。
> 基于 Geometry 的图元更灵活、更易修改。 它们根据 JavaScript 的类而来，像 Vector3 是 3D 的点，Face3 是三角形。 它们需要更多的内存，在能够被渲染前，Three.js 会将它们转换成相应的 BufferGeometry 表现形式。
> 如果你知道你不会操作图元，或者你擅长使用数学来操作它们，那么最好使用基于 BufferGeometry 的图元。 但如果你想在渲染前修改一些东西，那么 Geometry 的图元会更好操作。
> 举个简单的例子，BufferGeometry 不能轻松的添加新的顶点。 使用顶点的数量在创建时就定好了，相应的创建存储，填充顶点数据。 但用 Geometry 你就能随时添加顶点。

>现在并不明显是否右边有 5000 个三角形的比中间只有 480 个三角形的好更多。 如果你只是绘制少量球体，比如一个地球地图的球体，那么单个 10000 个三角形的球体就是个不错的选择。 但如果你要画 1000 个球体，那么 1000 个球体 x 10000 个三角形就是一千万个三角形。 想要动画流畅，你需要浏览器每秒绘制 60 帧，那么上面的场景就需要每秒绘制 6 亿个三角形。那是巨大的运算量。
> 细分的越少，运行的越流畅，使用的内存也会更少。 你需要根据你的具体情况选择合适的方案。

> 纹理往往是 three.js 应用中使用内存最多的部分。重要的是要明白，一般来说，纹理会占用 `宽度 * 高度 * 4 * 1.33` 字节的内存。
> Mips 是纹理的副本，每一个都是前一个 mip 的一半宽和一半高，其中的像素已经被混合以制作下一个较小的 mip。Mips一直被创建，直到我们得到1x1像素的Mip。
> 当纹理绘制的尺寸大于其原始尺寸时，你可以将 texture.magFilter 属性设置为 THREE.NearestFilter 或 THREE.LinearFilter 。NearestFilter 意味着只需从原始纹理中选取最接近的一个像素。对于低分辨率的纹理，这给你一个非常像素化的外观，就像Minecraft。
> LinearFilter 是指从纹理中选择离我们应该选择颜色的地方最近的4个像素，并根据实际点与4个像素的距离，以适当的比例进行混合。
> 在绘制的纹理小于其原始尺寸时设置过滤器，你可以将 texture.minFilter 属性设置为6个值

> `PerspectiveCamera` 定义了一个 视锥（frustum）。frustum 是一个切掉顶的三角锥或者说实心金字塔型。 说到实心体solid，在这里通常是指一个立方体、一个圆锥、一个球、一个圆柱或锥台。
> near定义了视锥的前端，far定义了后端，fov是视野，通过计算正确的高度来从摄像机的位置获得指定的以near为单位的视野，定义的是视锥的前端和后端的高度。aspect间接地定义了视锥前端和后端的宽度，实际上视锥的宽度是通过高度乘以 aspect 来得到的。

> 移动阴影贴图，有三种光可以投射阴影，分别为DirectionalLight 定向光、 PointLight 点光源、SpotLight 聚光灯
> 在场景中的每个网格，我们都能设置它是否能投射阴影或被投射阴影
> Three.js 默认使用shadow maps（阴影贴图），阴影贴图的工作方式就是具有投射阴影的光能对所有能被投射阴影的物体从光源渲染阴影。
> 如果你有 20 个物体对象、5 个灯光，并且所有的物体都能被投射阴影，所有的光都能投射阴影，那么这个场景这个场景将会绘制 6 次。第一个灯光将会为所有的物体投影阴影，绘制场景。然后是第二个灯光绘制场景，然后是第三个灯光，以此类推。最后一次（即第六次）将通过前五个灯光渲染的数据，渲染出最终的实际场景。
> 如果你有一个能投射阴影的点光源在这个场景中，那个这个场景将会为这个点光源再绘制 6 次。
> 解决性能问题：1）允许多个光源，但只让一个光源能投射阴影。2）使用光照贴图或者环境光贴图，预先计算离线照明的效果。这将导致静态光照，但是至少该方案渲染的非常快


> 在3D引擎里，雾通常是基于离摄像机的距离褪色至某种特定颜色的方式。在three.js中添加雾是通过创建 Fog 或者 FogExp2 实例并设定scene的fog 属性。
> Fog 让你设定 near 和 far 属性，代表距离摄像机的距离。任何物体比 near 近不会受到影响，任何物体比 far 远则完全是雾的颜色。在 near 和 far 中间的物体，会从它们自身材料的颜色褪色到雾的颜色。
> FogExp2 会根据离摄像机的距离呈指数增长。
> fog 在材料上有个布尔属性，用来设置渲染物体的材料是否会受到雾的影响。对于大多数材料而言默认设置为 true，也有需要关掉的例子，比如一个外面弥漫浓雾的房子，房子室内才材料应该不受影响


> 在three.js中，渲染目标大体上指的是可以被渲染的纹理。当它被渲染之后，你可以像使用其他纹理一样使用它。


> 在three.js中， BufferGeometry 是用来代表所有几何体的一种方式。 BufferGeometry 本质上是一系列 BufferAttributes 的 名称 。每一个 BufferAttribute 代表一种类型数据的数组：位置，法线，颜色，uv，等等…… 这些合起来， BufferAttributes 代表每个顶点所有数据的 并行数组 。

## Logs

- [x] [Fundamentals](https://threejs.org/manual/#zh%252Ffundamentals): 6.26 ✅
- [x] [Responsive](https://threejs.org/manual/#zh%252Fresponsive): 6.27 ✅
- [x] [Primitives 图元](https://threejs.org/manual/#zh%252Fprimitives): 6.27 ✅
- [x] [Scenegraph 场景图](https://threejs.org/manual/#zh/scenegraph): 6.29 ✅
- [x] [Materials 材质](https://threejs.org/manual/#zh%252Fmaterials): 6.29 ✅
- [x] [Texture 纹理](https://threejs.org/manual/#zh%252Ftextures): 6.30 ✅
- [x] [Lights 光照](https://threejs.org/manual/#zh/lights): 7.3 ✅
- [x] [Cameras 摄像机](https://threejs.org/manual/#zh/cameras): 7.5 ✅
- [x] [Shadows 阴影](https://threejs.org/manual/#zh/shadows): 7.6 ✅
- [x] [Fog 雾](https://threejs.org/manual/#zh/fog): 7.7 ✅
- [x] [Rendertargets 渲染目标](https://threejs.org/manual/#zh/rendertargets): 7.7 ✅
- [x] [Custom Buffergeometry 自定义缓冲几何体](https://threejs.org/manual/#zh/custom-buffergeometry): 7.10 ✅
- [x] [Snowglobe example](https://enlight.nyc/projects/snowglobe-threejs): 7:31 ✅
