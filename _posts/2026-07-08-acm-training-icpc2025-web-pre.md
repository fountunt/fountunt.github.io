---
layout: post
title: "ICPC 2025 网络预选赛题目解析——ACM暑假集训 Day 3"
date: 2026-07-08 23:00:00 +0800
categories: [ACM暑假集训]
tags: [ICPC,贪心,DSU,Dijkstra,树形DP,组合数学,坐标变换]
---

今天做了 ICPC 2025 网络预选赛（第一场）的题目，从 A 到 J 涵盖了模拟、贪心、DSU、Dijkstra 变种、树形 DP 和组合数学等多种题型。

## A — Who Can Win（冠军判定）

**题意**：给定封榜后的提交记录，Unknown 的提交可以独立地选择为 Accepted 或 Rejected。要求找出所有**可能成为冠军**的队伍。

**解法**：对每支队伍独立判断。计算每支队伍的**最佳战绩**（所有 Unknown 帮它）和**最差战绩**（所有 Unknown 针对它）：

- **最佳**：有原始 AC 或有 Unknown 的题目都算解题，罚时取所有可能 first AC 位置中最小的
- **最差**：只有原始 AC 才算解题，first AC 之前的所有 Unknown 当 Rejected 加罚时

判断时，若队伍 T 的最佳能赢过所有对手的最差 → T 可能是冠军。

编码上有一个非常巧妙的写法：用 `M = 10^7` 把（解题数, 罚时）编码成一个整数 `w = solves × M + (M - penalty)`，一次比较搞定。

```cpp
// 结果编码: 0=Rejected, 1=Accepted, 2=Unknown
// s=0 最差, s=1 最佳
for(auto t : g[k])
    if(!vis[t[1]])
    {
        // Rejected 或 (Unknown 且在最差情况) → 加罚时
        if(t[2]==0 || (t[2]==2 && s==0)) sm[t[1]] += 20;
        else {  // Accepted → 编码成绩
            w[k][s] += M - sm[t[1]] - t[0];
            vis[t[1]] = 1;
        }
    }
```

**坑点**：Unknown 编码为 2，不是 0！一开始我把这个搞反了，导致找了个假的 hack。

---

## Sorting（排序问题）

**题意**：给定 m 个比较器 (aᵢ, bᵢ)（1 ≤ a < b ≤ n），程序无限循环按顺序执行这些比较器，问能否排序任意排列。

**结论**：必须包含所有相邻对 (i, i+1)，否则不行。

**证明**：考虑只有位置 i 和 i+1 反序、其他元素都已排好的情况。没有直接比较 (i, i+1) 的边，这两个元素永远不会被交换，因为比较器是按**位置下标**固定的，而不是按值。

```cpp
for(int i = 1; i <= m; i++) {
    int a, b; cin >> a >> b;
    if(b == a + 1) cnt[b] = 1;
}
for(int i = 2; i <= n; i++)
    if(!cnt[i]) { cout << "No"; return; }
cout << "Yes";
```

---

## C — CanvasPainting（最少剩余颜色）

**题意**：画布 n 个格子，初始颜色 a[i] = i。m 个咒语，每个咒语可以在区间 [l, r] 内选两个位置执行 a[u] = a[v]（消灭一种颜色）。每个咒语只能用一次。求最少剩余颜色数。

**解法**：每个咒语最多消灭一种颜色。问题转化为——最多能有多少个咒语"生效"？

贪心策略：**按右端点升序**处理区间。对每个区间 [l, r)，在 DSU 中找第一个空闲位置 `find(l)`，若 `< r` 则生效。

为什么按 r 排？右端点小的区间选择面更窄（只能选 l ~ r-1 之间的位置），先服务最紧迫的。右端点大的区间选择多，可以等后面再挑。

```cpp
map<int,int> f;
int find(int u) { return f[u]==0 ? u : f[u]=find(f[u]); }

sort(a+1, a+n+1, [](Node x, Node y){ return x.r < y.r; });

int ans = m;
for(int i = 1; i <= n; i++) {
    if(find(a[i].l) != a[i].r) {
        ans--;
        f[find(a[i].l)] = find(a[i].l) + 1;
    }
}
```

**点睛**：`map<int,int>` 做**懒 DSU**，因为 n ≤ 10⁹ 不可能开数组，而实际访问的位置只有 O(m) 个。`f[u]=0` 表示"u 自己就是空闲的"。

| 排序方式 | 能保证最优吗？ |
|---------|:-----------:|
| 按 r 升序 | ✅ 有理论保证 |
| 按 l 升序 | ❌ 大区间会抢小区间的唯一选择 |
| 按长度 | ❓ 大部分情况对，但边界不确定 |

---

## I — Knapsack Problem（背包最短路）

**题意**：无向图，每条边有物品重量 wᵢ。背包容量 V，装不下就换新包（丢弃旧的）。从每个点到 T，求最少背包数。

**解法**：从 T 反向跑 Dijkstra，状态用**一个数编码两维信息**：

```
d[v] = (用过的背包数-1) × V + (当前背包已装容量)
```

转移时，沿反向边 (v←u, w)：
- **没换包**：容量够，直接加回 `nw = vol + w`
- **换过包**：还原换包操作 `nw = (vol/V)*V + V + w`

```cpp
int nw = vol + w;
if(vol % V + w > V)   // 当前包装不下 → 说明原来换过包
    nw = (vol/V)*V + V + w;
else
    nw = vol + w;
```

输出时：`(d[i]-1)/V + 1` 就是背包总数。

**为什么 (d[i]-1)/V + 1？** T 本身出发时背包装满（d[T]=0），需要 1 个背包。减 1 再除再加 1 就是这个效果。

---

## D — Teleporter（树上传送门 DP）

**题意**：n 个城市形成一棵树，有 m 条传送门（零花费），最多用 k 次。对每个 k = 0~n，求 Σ d(u,k)，其中 d(u,k) 为从 u 到 1 的最少时间。

**解法**：O(n²) DP，外层循环枚举传送门使用次数：

```cpp
for(int i = 0; i <= n; i++) {    // 第 i 轮 = 可以用 i 次传送门
    dfs1(1, 0);   // 自底向上：用子节点和传送门更新 d[u]
    dfs2(1, 0);   // 自顶向下：用父节点更新 d[v]，累加 ans
    memcpy(f, d, sizeof(f));   // 保存到 f，给下一轮用
    printf("%lld\n", ans);     // 输出 k=i 时的结果
}
```

```cpp
void dfs1(int u, int x) {
    // 先考虑传送门（用上一轮的结果 f）
    for(int v : g[u]) d[u] = min(d[u], f[v]);
    // 再考虑子节点
    for(auto [v, w] : G[u]) if(v != x)
        dfs1(v, u), d[u] = min(d[u], d[v] + w);
}

void dfs2(int u, int x) {
    for(auto [v, w] : G[u]) if(v != x)
        d[v] = min(d[v], d[u] + w), dfs2(v, u);
    ans += d[u];
}
```

**核心思想**：`f[v]` 是上一轮（用 k-1 次传送门）的结果。传送门跳到 v 之后，还需要从 v 走到 1，这部分代价已经存在 `f[v]` 里了。每轮迭代多增加一次传送门的使用机会，直到收敛（最多 n-1 次就够）。

---

## J — Moving on the Plane（平面游走计数）

**题意**：N 个点，每步必须移动一格（上下左右）。走 M 步后，要求所有点之间曼哈顿距离 ≤ K。求方案数模 998244353。

**解法**：这个解法非常精彩，分几步走：

### Step 1：坐标变换

曼哈顿距离 → 切比雪夫距离：

```
a = x + y    b = x - y
|x₁-x₂| + |y₁-y₂| = max(|a₁-a₂|, |b₁-b₂|)
```

条件"极差 ≤ K"在 a、b 两维上分别独立，只需保证 **a 极差 ≤ K 且 b 极差 ≤ K**。

### Step 2：一维游走

走 M 步后，a 坐标从 a₀ 到 a_M 的方案数：
```
u = (M + a_M - a₀) / 2 步 +1,  v = M - u 步 -1
方案数 = C(M, u)，要求 M + a_M - a₀ 是偶数
```

### Step 3：加权计数 — cal 函数

`cal(a, k)` 统计 a 坐标极差 ≤ k 的**加权**方案数：

```cpp
int cal(int *a, int kk) {
    int ans = 0;
    for(int i = a[1] - m - kk; i <= a[n] + m; i++) {
        int t = 1;
        for(int j = 1; j <= n; j++) {
            int s = 0;
            for(int k = i; k <= i + kk; k++)
                if(!((m + k - a[j]) & 1))
                    s += c(m, (m + k - a[j]) / 2);
            t = t * (s % p) % p;
        }
        ans += t;   // 所有点落在 [i, i+kk] 内的方案数
    }
    return ans % p;
}
```

注意这里**每个极差 r 的配置被计了 (kk - r + 1) 次**，因为左端点 i 可以在范围内滑动。

### Step 4：相减消去权重

```cpp
count(k) = cal(a, k) - cal(a, k-1)
```

因为：
```
cal(k)   = Σᵣ₌₀ᵏ  (k - r + 1) × count(r)
cal(k-1) = Σᵣ₌₀ᵏ⁻¹ (k - r) × count(r)
相减     = Σᵣ₌₀ᵏ  1 × count(r) = count(k)
```

完美消去权重，得到真正的方案数！

### Step 5：合并

```cpp
ans = count_a(K) × count_b(K) mod 998244353
```

a、b 独立，相乘即得。

---

## 总结

今天的题目各有各的精妙之处：

| 问题 | 知识点 | 难度 |
|------|--------|:----:|
| A — Who Can Win | 贪心、最佳/最差分析 | ⭐⭐ |
| Sorting | 排序网络、必要条件 | ⭐ |
| C — CanvasPainting | DSU、贪心（按右端点排序） | ⭐⭐⭐ |
| I — Knapsack Problem | Dijkstra、一维编码两维状态 | ⭐⭐⭐ |
| D — Teleporter | 树形 DP、迭代传播 | ⭐⭐⭐⭐ |
| J — Moving on the Plane | 坐标变换、组合计数、消去权重 | ⭐⭐⭐⭐⭐ |

今天的最大收获是 **C 题 DSU + map** 和 **J 题的坐标变换 + 加权计数消去**，前者展示了如何用懒 DSU 解决大范围资源分配问题，后者把几何问题转化为纯组合计数并用巧妙的代数技巧消去多计权重。I 题用一维编码存两维状态跑 Dijkstra 的写法也很值得学习。
