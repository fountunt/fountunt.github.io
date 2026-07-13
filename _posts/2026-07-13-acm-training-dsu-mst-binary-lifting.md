---
layout: post
title: "ACM暑假集训：并查集、最小生成树与树上倍增"
date: 2026-07-13 23:00:00 +0800
categories: [ACM暑假集训]
tags: [DSU, MST, Kruskal, Prim, 0-1 MST, 树上倍增, LCA, LCA倍增]
---

今天整理了 ACM 竞赛中的三个重要工具：**并查集（DSU）**、**最小生成树（MST）** 和 **树上倍增（Binary Lifting）**。前两个是图论入门阶段的必备数据结构，后者则是树上问题的核心优化手段。

---

## 一、并查集（Disjoint Set Union）

并查集是竞赛中最基础也最高效的数据结构之一，几乎**所有和图论连通性相关的问题**都离不开它。

### 核心操作

- `find(x)`：查询 x 所在集合的根，同时做路径压缩
- `unite(x, y)`：合并 x 和 y 所在的集合

```cpp
struct DSU {
    vector<int> fa, sz;
    DSU(int n) {
        fa.resize(n);
        sz.resize(n, 1);
        for (int i = 0; i < n; ++i) fa[i] = i;
    }
    int find(int x) {
        return fa[x] == x ? x : fa[x] = find(fa[x]);
    }
    bool unite(int x, int y) {
        x = find(x), y = find(y);
        if (x == y) return false;
        if (sz[x] < sz[y]) swap(x, y);
        fa[y] = x; sz[x] += sz[y];
        return true;
    }
};
```

**路径压缩** + **按大小合并** 一起使用，均摊复杂度几乎是常数 O(α(n))。

### 几个变形

| 变种 | 适用场景 |
|------|---------|
| **带权并查集** | 维护节点间相对关系（食物链、区间奇偶性） |
| **可撤销并查集** | 支持回退，配合线段树分治解决动态连通性 |
| **懒 DSU（map 实现）** | 值域极大但操作稀疏时，代替数组 |

#### 带权并查集

```cpp
struct DSU {
    vector<int> fa;
    vector<long long> dist;  // dist[x] = x 到 fa[x] 的权值

    int find(int x) {
        if (fa[x] == x) return x;
        int root = find(fa[x]);
        dist[x] += dist[fa[x]];   // 路径压缩时累加
        return fa[x] = root;
    }

    bool unite(int x, int y, long long w) {
        // val(y) - val(x) = w
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        fa[rx] = ry;
        dist[rx] = -dist[x] + w + dist[y];
        return true;
    }
};
```

#### 可撤销并查集

```cpp
struct RollbackDSU {
    vector<int> fa, sz;
    vector<tuple<int,int,int>> stk;

    int find(int x) {
        while (fa[x] != x) x = fa[x];
        return x;  // 不能路径压缩！
    }

    bool unite(int x, int y) {
        x = find(x), y = find(y);
        if (x == y) return false;
        if (sz[x] < sz[y]) swap(x, y);
        stk.emplace_back(x, y, sz[x]);
        fa[y] = x; sz[x] += sz[y];
        return true;
    }

    void rollback() {
        auto [x, y, old] = stk.back(); stk.pop_back();
        fa[y] = y; sz[x] = old;
    }

    int snapshot() { return stk.size(); }
    void rollback_to(int snap) {
        while (stk.size() > snap) rollback();
    }
};
```

---

## 二、最小生成树（MST）

### 2.1 Kruskal — O(m log m)

适合**稀疏图**，按边权排序后依次用并查集加入。

```cpp
struct Edge { int u, v, w; };
sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a.w < b.w; });

DSU dsu(n);
ll sum = 0;
for (auto& [u, v, w] : edges) {
    if (dsu.unite(u, v)) sum += w;
}
```

### 2.2 Prim — O((n+m) log n)

适合**稠密图**，用优先队列每次取距离最小的点。

```cpp
priority_queue<PII, vector<PII>, greater<PII>> pq;
vector<long long> dis(n+1, INF);
vector<bool> vis(n+1, false);

dis[1] = 0; pq.emplace(0, 1);
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (vis[u]) continue;
    vis[u] = true; ans += d;
    for (auto& [v, w] : g[u])
        if (!vis[v] && w < dis[v])
            dis[v] = w, pq.emplace(w, v);
}
```

### 2.3 0-1 MST（特殊套路）

当完全图的边权只有 0 和 1 时，可以用**补图 BFS**在 O(n+m) 内解决。

核心思想：把所有顶点放进 `set<int> unvisited`，BFS 时只遍历 `unvisited` 中**不属于 `bad[u]`** 的顶点——这些顶点和 u 之间有 0 边。找到的每一个连通分量就是一个 0-块，块间用 1 边连接。

```
答案 = (连通块数 - 1) × 1
```

```cpp
int zo_mst(int n, const vector<vector<int>>& bad) {
    set<int> uvis;
    for (int i = 1; i <= n; ++i) uvis.insert(i);

    int comps = 0;
    while (!uvis.empty()) {
        ++comps;
        int s = *uvis.begin(); uvis.erase(uvis.begin());
        queue<int> q; q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            vector<int> removed;
            for (int v : uvis)
                if (!binary_search(bad[u].begin(), bad[u].end(), v))
                    removed.push_back(v);
            for (int v : removed)
                uvis.erase(v), q.push(v);
        }
    }
    return comps - 1;
}
```

### 2.4 每条边的最小生成树（CF 609E）

> 给定一张连通图，对每条边，求包含该边的 MST 的最小可能权值。

解法：
1. 先求整个图的 MST，记权值和为 `sum`
2. 对每条边：
   - 在 MST 中 → 答案就是 `sum`
   - 不在 MST 中 → 加入后会形成环，**替换掉环上的最大边**，答案 = `sum - maxOnPath(u,v) + w`

问题转化为：快速求 MST 中 `u → v` 路径上的最大边权。这个需要**树上倍增**。

---

## 三、树上倍增（Binary Lifting on Tree）

### 核心思想

预处理每个节点向上跳 $2^j$ 步到达的祖先，以及路径上的信息。查询时将步数拆成二进制，在 O(log n) 内完成。

```cpp
const int LOG = __lg(n) + 1;
vector<int> dep(n + 1);
vector<vector<int>> up(n + 1, vector<int>(LOG));
vector<vector<int>> mx(n + 1, vector<int>(LOG, 0));

function<void(int,int,int)> dfs = [&](int u, int p, int w) {
    up[u][0] = p;
    mx[u][0] = w;
    for (int j = 1; j < LOG; ++j) {
        up[u][j] = up[up[u][j - 1]][j - 1];
        mx[u][j] = max(mx[u][j - 1], mx[up[u][j - 1]][j - 1]);
    }
    for (auto& [v, w2] : tree[u]) {
        if (v == p) continue;
        dep[v] = dep[u] + 1;
        dfs(v, u, w2);
    }
};
dfs(1, 0, 0);
```

`mx[u][j]` 可以换成任意**可合并**的信息（min、sum、xor、gcd 等），只需要改 `mx[u][j] = merge(mx[u][j-1], mx[up[u][j-1]][j-1])`。

### 求 LCA

```cpp
int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int j = 0; j < LOG; ++j)
        if (diff >> j & 1) u = up[u][j];
    if (u == v) return u;
    for (int j = LOG - 1; j >= 0; --j)
        if (up[u][j] != up[v][j])
            u = up[u][j], v = up[v][j];
    return up[u][0];
}
```

### 查询路径最大边

```cpp
int path_max(int u, int v) {
    int res = 0;
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int j = 0; j < LOG; ++j)
        if (diff >> j & 1) res = max(res, mx[u][j]), u = up[u][j];
    if (u == v) return res;
    for (int j = LOG - 1; j >= 0; --j)
        if (up[u][j] != up[v][j]) {
            res = max({res, mx[u][j], mx[v][j]});
            u = up[u][j], v = up[v][j];
        }
    res = max({res, mx[u][0], mx[v][0]});
    return res;
}
```

这样 CF 609E 的问题就迎刃而解了：

```cpp
for (auto& e : edges) {
    if (in_mst[e.id]) ans[e.id] = sum;
    else ans[e.id] = sum - path_max(e.u, e.v) + e.w;
}
```

---

## 四、树上倍增不止是 LCA

很多人以为树上倍增就是用来求 LCA 的，其实它是一个更泛用的工具：

| 应用 | 只需倍增，不需 LCA |
|------|:-----------------:|
| 第 k 级祖先 | ✅ |
| 到根的路径信息 | ✅ |
| 链上二分查找 | ✅ |
| LCA | 需要 |
| 任意两点路径信息 | 需要 LCA 辅助 |

**树上倍增的本质**是「二进制拆分 + 跳跃查询」，只要问题能从某个节点向上合并信息，就能用。CF 609E 就是一个典型例子——我们需要的不是 LCA，而是路径上的最大边，LCA 只是辅助找到路径端点。

---

## 五、总结

今天整理的三种工具：

| 工具 | 复杂度 | 核心技巧 | 典型应用 |
|------|--------|---------|---------|
| **DSU** | O(α(n)) | 路径压缩 + 按秩合并 | 连通性、Kruskal |
| **MST** | O(m log m) | Kruskal / Prim | 最小生成树 |
| **树上倍增** | O(n log n) 预处理 / O(log n) 查询 | 二进制拆分 | LCA、路径询问 |

这三样是 ACM 图论题中最常见的组合拳，几乎所有中档图论题都少不了它们。尤其是在**次小生成树、动态 MST、树上路径问题**这些方向，树上倍增几乎是唯一能在 O(log n) 时间内回答路径查询的手段。

今天把模板整理到了 `C:\模板\` 目录下，方便后续比赛直接复制使用。
